/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2012-2022. All rights reserved.
 */

package org.opengauss.monitor.service.impl;

import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpStatus;
import org.opengauss.monitor.common.contant.ConmmonShare;
import org.opengauss.monitor.common.contant.ScheduleCommon;
import org.opengauss.monitor.config.NagiosConfig;
import org.opengauss.monitor.entity.MFilter;
import org.opengauss.monitor.entity.MonitorResult;
import org.opengauss.monitor.entity.ResponseVO;
import org.opengauss.monitor.entity.SysConfig;
import org.opengauss.monitor.entity.SysSourceTarget;
import org.opengauss.monitor.entity.TargetSource;
import org.opengauss.monitor.entity.zabbix.ZabbixMessge;
import org.opengauss.monitor.exception.job.TaskException;
import org.opengauss.monitor.manager.MonitorManager;
import org.opengauss.monitor.manager.factory.AsyncFactory;
import org.opengauss.monitor.mapper.SysConfigMapper;
import org.opengauss.monitor.mapper.SysJobMapper;
import org.opengauss.monitor.mapper.SysSourceTargetMapper;
import org.opengauss.monitor.quartz.domain.SysJob;
import org.opengauss.monitor.quartz.util.MonitorTaskUtils;
import org.opengauss.monitor.service.ISysJobService;
import org.opengauss.monitor.service.MonitorService;
import org.opengauss.monitor.service.MonitorFlake;
import org.opengauss.monitor.util.AssertUtil;
import org.opengauss.monitor.util.Base64;
import org.opengauss.monitor.util.HandleUtils;
import org.opengauss.monitor.util.SqlUtil;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobDataMap;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.DependsOn;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;

/**
 * 定时任务工具类
 *
 * @author liu
 * @since 2022-10-01
 */
@Slf4j
@DependsOn("generatorFile")
@Service
public class SysJobServiceImpl implements ISysJobService {
    /**
     * 数字正则
     */
    private static final String ISNUM = "^(\\-|\\+)?\\d+(\\.\\d+)?$";

    private static final String FITE = StrUtil.LF;

    /**
     * 科学计数法
     */
    private static final String KEXUE = "^[+-]?\\d+\\.?\\d*[Ee][+-]?\\d+$";

    @Autowired
    private Scheduler scheduler;

    @Autowired
    private SysJobMapper jobMapper;

    @Autowired
    private SysConfigMapper configMapper;

    @Autowired
    private MonitorService monitorService;

    @Autowired
    private SysSourceTargetMapper sourceTargetMapper;

    @Autowired
    private ZabbixServiceImpl zabbixService;

    @Autowired
    private CommonServiceImpl commonService;

    @Autowired
    private NagiosServiceImpl nagiosService;

    @Value("${date.pattern}")
    private String dataPattern;

    private MonitorFlake MonitorFlake = new MonitorFlake(11, 11);

    private JdbcTemplate jdbcTemplate;


    /**
     * 预加载
     *
     * @throws SchedulerException SchedulerException
     * @throws TaskException      TaskException
     */
    @PostConstruct
    public void init() throws SchedulerException, TaskException {
        scheduler.clear();
        List<SysJob> jobList = jobMapper.selectJobAll();
        for (SysJob job : jobList) {
            MonitorTaskUtils.createMonitorJob(scheduler, job);
        }
    }

    /**
     * 列表
     *
     * @param page page
     * @param size size
     * @param job  job
     * @return ResponseVO responseVO
     */
    @Override
    public ResponseVO selectAllJob(Integer page, Integer size, SysJob job) {
        List<SysJob> sysJobs = jobMapper.selectJobAll();
        // 添加 发布信息
        addPublish(sysJobs, job);
        sortJob(sysJobs);
        List<String> platForm = sysJobs.stream().map(SysJob::getPlatform).distinct().collect(Collectors.toList());
        List<String> targetGroup = sysJobs.stream().map(SysJob::getTargetGroup).distinct().collect(Collectors.toList());
        List<MFilter> form = new ArrayList<>();
        List<MFilter> group = new ArrayList<>();
        dealMap(platForm, targetGroup, form, group);
        Map<String, Object> myResMap = new HashMap<>();
        myResMap.put("platForm", form);
        myResMap.put("targetGroup", group);
        sysJobs = filter(sysJobs, job);
        List<SysJob> resulte = new ArrayList<>();
        if (ObjectUtil.isNotEmpty(job) && ObjectUtil.isNotEmpty(job.getIsManagement()) && job.getIsManagement()) {
            resulte = sysJobs;
        } else {
            resulte = sysJobs.stream().skip((page - 1) * size).limit(size).collect(Collectors.toList());
        }
        addIsCanUpdate(resulte);
        myResMap.put("tableData", resulte);
        return ResponseVO.pageResponseVO(sysJobs.size(), myResMap);
    }

    @Override
    public MonitorResult getDefaultTarget() {
        List<SysJob> sysJobs = jobMapper.selectJobAll();
        if (CollectionUtil.isNotEmpty(sysJobs)) {
            sysJobs = sysJobs.stream()
                    .filter(item -> item.getTargetGroup().equals(ConmmonShare.SYSTEMTARGET)).collect(Collectors.toList());
            return MonitorResult.success(sysJobs);
        }
        return MonitorResult.success(new ArrayList<>());
    }

    private void addIsCanUpdate(List<SysJob> resulte) {
        // 获得所有已经发布的指标
        List<Long> publishJobIds = sourceTargetMapper.getPublishJobIds();
        List<SysConfig> sysConfigs = configMapper.getAllConfig();
        List<Long> ids = sysConfigs.stream().map(SysConfig::getDataSourceId).collect(Collectors.toList());
        if (CollectionUtil.isEmpty(resulte)) {
            return;
        }
        for (SysJob sysJob : resulte) {
            if (ObjectUtil.isNotEmpty(sysJob)
                    && ObjectUtil.isNotEmpty(sysJob.getDataSourceId())
                    && !ids.contains(sysJob.getDataSourceId())) {
                sysJob.setDataSourceId(null);
            }
            if (CollectionUtil.isNotEmpty(publishJobIds)) {
                Long id = publishJobIds.stream()
                        .filter(item -> ObjectUtil.isNotEmpty(item) && item.equals(sysJob.getJobId())).findFirst()
                        .orElse(null);
                if (id == null) {
                    sysJob.setIsCanUpdate(true);
                } else {
                    sysJob.setIsCanUpdate(false);
                }
            } else {
                sysJob.setIsCanUpdate(true);
            }
        }
    }

    /**
     * addPublish
     *
     * @param sysJobs sysJobs
     * @param job     job
     */
    private void addPublish(List<SysJob> sysJobs, SysJob job) {
        // 根据job获得该主机已经发布的指标
        if (ObjectUtil.isNotEmpty(job) && job.getDataSourceId() != null) {
            List<Long> jobIds = sourceTargetMapper.getJobIdBySourceId(job.getDataSourceId());
            for (SysJob sysJob : sysJobs) {
                if (ObjectUtil.isNotEmpty(sysJob)
                        && CollectionUtil.isNotEmpty(jobIds)
                        && jobIds.contains(sysJob.getJobId())) {
                    sysJob.setIsPbulish(true);
                } else {
                    sysJob.setIsPbulish(false);
                }
            }
        }
    }

    /**
     * filter
     *
     * @param sysJobs sysJobs
     * @param job     job
     * @return list
     */
    private List<SysJob> filter(List<SysJob> sysJobs, SysJob job) {
        List<SysJob> result = new ArrayList<>();
        if (job != null) {
            result = sysJobs;
            if (StrUtil.isNotEmpty(job.getPlatform())) {
                List<String> platForm = Arrays.asList(job.getPlatform().split(","));
                result = sysJobs.stream()
                        .filter(item -> platForm.contains(item.getPlatform()))
                        .collect(Collectors.toList());
            }
            if (StrUtil.isNotEmpty(job.getTargetGroup())) {
                List<String> targetGroup = Arrays.asList(job.getTargetGroup().split(","));
                result = sysJobs.stream()
                        .filter(item -> targetGroup.contains(item.getTargetGroup()))
                        .collect(Collectors.toList());
            }
            if (CollectionUtil.isNotEmpty(job.getTimeInterval()) && job.getTimeInterval().size() == 2) {
                List<String> strings = job.getTimeInterval();
                SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                try {
                    Date start = simpleDateFormat.parse(strings.get(0));
                    Date end = simpleDateFormat.parse(strings.get(1).substring(0, 10) + " " + "23:59:59");
                    result = sysJobs.stream()
                            .filter(item -> !item.getCreateTime().before(start) && !item.getCreateTime().after(end))
                            .collect(Collectors.toList());
                } catch (ParseException e) {
                    log.error("simpleDateFormat_parse,{}", e.getMessage());
                }
            }
            return result;
        } else {
            return sysJobs;
        }
    }

    /**
     * dealMap
     *
     * @param platForm    platForm
     * @param targetGroup targetGroup
     * @param form        form
     * @param group       group
     */
    private void dealMap(List<String> platForm, List<String> targetGroup, List<MFilter> form, List<MFilter> group) {
        for (String str : platForm) {
            MFilter mFilter = new MFilter();
            mFilter.setText(str);
            mFilter.setValue(str);
            form.add(mFilter);
        }
        for (String str : targetGroup) {
            MFilter mFilter = new MFilter();
            mFilter.setText(str);
            mFilter.setValue(str);
            group.add(mFilter);
        }
    }

    /**
     * sortJob
     *
     * @param sysJobs sysJobs
     */
    private void sortJob(List<SysJob> sysJobs) {
        // 按照number从大到小排序
        sysJobs.sort(Comparator.comparing(SysJob::getTime).reversed());
    }

    /**
     * batchPublish
     *
     * @param targetSource targetSource
     * @return MonitorResult MonitorResult
     * @throws SchedulerException SchedulerException
     */
    @Override
    public MonitorResult batchPublish(TargetSource targetSource) throws SchedulerException {
        if (ObjectUtil.isEmpty(targetSource)
                || CollectionUtil.isEmpty(targetSource.getDataSourceId())
                || CollectionUtil.isEmpty(targetSource.getJobIds())) {
            return MonitorResult.error("发布信息不能为空");
        }
        List<Long> jobIds = targetSource.getJobIds().stream().distinct().collect(Collectors.toList());
        List<SysJob> sysJobs = jobMapper.selectBatchJobByIds(jobIds);
        List<SysJob> zabbix = sysJobs.stream()
                .filter(item -> ConmmonShare.ZABBIX.equals(item.getPlatform())).collect(Collectors.toList());
        List<SysJob> nagios = sysJobs.stream()
                .filter(item -> ConmmonShare.NAGIOS.equals(item.getPlatform())).collect(Collectors.toList());
        // 判断是否有zabbix数据源 nagios数据源
        SysConfig zabbixConfig = configMapper.getZabbixConfig();
        SysConfig nagiosConfig = configMapper.getNagiosConfig();
        if (ObjectUtil.isEmpty(zabbixConfig) && CollectionUtil.isNotEmpty(zabbix)) {
            return MonitorResult.error("请先配置Zabbix数据源信息");
        }
        if (ObjectUtil.isEmpty(nagiosConfig) && CollectionUtil.isNotEmpty(nagios)) {
            return MonitorResult.error("请先配置Nagios配置信息");
        }
        List<SysSourceTarget> list = new ArrayList<>();
        List<Long> dateSource = targetSource.getDataSourceId();
        for (Long id : dateSource) {
            SysSourceTarget sourceTarget = new SysSourceTarget();
            sourceTarget.setDataSourceId(id);
            sourceTarget.setJobIds(targetSource.getJobIds());
            list.add(sourceTarget);
        }
        for (SysSourceTarget sourceTarget : list) {
            singlePublish(sourceTarget, sysJobs, zabbixConfig, nagiosConfig);
        }
        return MonitorResult.success("批量发布成功");
    }

    /**
     * singlePublish
     *
     * @param sourceTarget sourceTarget
     * @param sysJobs      sysJobs
     * @param zabbixConfig zabbixConfig
     * @param nagiosConfig nagiosConfig
     * @return MonitorResult MonitorResult
     * @throws SchedulerException SchedulerException
     */
    public MonitorResult singlePublish(SysSourceTarget sourceTarget,
                                       List<SysJob> sysJobs,
                                       SysConfig zabbixConfig,
                                       SysConfig nagiosConfig) throws SchedulerException {
        SysConfig sysConfig = configMapper.getConfigByid(sourceTarget.getDataSourceId());
        if (sysConfig == null) {
            return MonitorResult.error("没有该主机信息");
        }
        // 该主机下面的指标需要停掉原来的,发布最新的
        // 获得原来该主机下面的指标信息
        List<Long> oldJobIds = sourceTargetMapper.getJobIdBySourceId(sourceTarget.getDataSourceId());
        // 根据jobids获得所有job
        List<SysJob> oldSysJob = jobMapper.selectBatchJobByIds(oldJobIds);
        List<SysJob> newSysjob = jobMapper.selectBatchJobByIds(sourceTarget.getJobIds());
        oldSysJob.removeAll(newSysjob);
        // 先停止旧的job,删除后,开启有其他主机在用job
        stopTimeTask(oldSysJob);
        // 保存最新的主机发布信息
        sourceTargetMapper.save(sourceTarget);
        // 删除
        List<String> remove = dealOldSysJob(oldSysJob, sysConfig.getConnectName());
        MonitorManager.mine().work(AsyncFactory.removeRegistry(remove));
        // 筛选出有其他主机在用的指标
        List<SysJob> otherSysJob = sourceTargetMapper.getMoreThanOneSource(oldSysJob);
        List<SysJob> zabbix = sysJobs.stream()
                .filter(item -> ConmmonShare.ZABBIX.equals(item.getPlatform())).collect(Collectors.toList());
        List<SysJob> nagios = sysJobs.stream()
                .filter(item -> ConmmonShare.NAGIOS.equals(item.getPlatform())).collect(Collectors.toList());
        sysJobs.addAll(otherSysJob);
        // 剔除掉nagios
        sysJobs.removeAll(nagios);
        // 发布最新的
        startTimeTask(sysJobs);
        // 执行zabbix 发布任务
        if (CollectionUtil.isNotEmpty(zabbix)) {
            MonitorManager.mine().work(AsyncFactory.recordZabbix(zabbix, sysConfig, zabbixConfig));
        }
        if (CollectionUtil.isNotEmpty(nagios)) {
            MonitorManager.mine().work(AsyncFactory.recordNagios(nagios, sysConfig, nagiosConfig));
        }
        // 延迟执行nagios
        if (CollectionUtil.isNotEmpty(nagios)) {
            MonitorManager.mine().work(AsyncFactory.executeNagios(nagios));
        }
        return MonitorResult.success("发布成功");
    }

    /**
     * publishNagios
     *
     * @param nagios       nagios
     * @param sysConfig    sysConfig
     * @param nagiosConfig nagiosConfig
     */
    public void publishNagios(List<SysJob> nagios, SysConfig sysConfig, SysConfig nagiosConfig) {
        Map<String, Object> all = new HashMap<>();
        sysConfig.setPassword(Base64.decode(sysConfig.getPassword()));
        for (SysJob sysJob : nagios) {
            DriverManagerDataSource dataSource = getDataSource(sysConfig);
            jdbcTemplate = new JdbcTemplate(dataSource);
            List<Map<String, Object>> list = executeSql(jdbcTemplate, sysJob.getTarget());
            // 空指针，将value为null的给个默认值
            dealList(list);
            String name = sysConfig.getConnectName();
            Map<String, Object> nagiosMap = new HashMap<>();
            addMap(list, all, name, sysJob, nagiosMap);
        }
        nagiosService.setConfig(all, nagiosConfig);
    }

    private void addMap(List<Map<String, Object>> list, Map<String, Object> all,
                        String name, SysJob sysJob, Map<String, Object> nagiosMap) {
        for (int i = 0; i < list.size(); i++) {
            Map<String, Object> arry = list.get(i);
            Map<String, Object> metric = HandleUtils.getMap(arry);
            dealMetric(metric, i);
            for (Map.Entry<String, Object> entry : arry.entrySet()) {
                if (entry.getValue().toString().matches(ISNUM) || entry.getValue().toString().matches(KEXUE)) {
                    nagiosMap.put(entry.getKey()
                            + "_" + sysJob.getJobName() + "_" + name + "_" + i, entry.getValue());
                    all.putAll(nagiosMap);
                }
            }
        }
    }

    private void dealList(List<Map<String, Object>> list) {
        for (Map<String, Object> maps : list) {
            for (Map.Entry<String, Object> entry : maps.entrySet()) {
                if (ObjectUtil.isEmpty(entry.getValue()) && !entry.getKey().equalsIgnoreCase("toastsize")) {
                    maps.put(entry.getKey(), "default");
                }
                if (ObjectUtil.isEmpty(entry.getValue()) && entry.getKey().equalsIgnoreCase("toastsize")) {
                    maps.put(entry.getKey(), "0");
                }
                if (entry.getValue().toString().startsWith(".")) {
                    String value = "0" + entry.getValue().toString();
                    maps.put(entry.getKey(), value);
                }
            }
        }
    }

    /**
     * startNagios
     *
     * @param nagios nagios
     */
    public void startNagios(List<SysJob> nagios) {
        try {
            Thread.sleep(NagiosConfig.getDelayTime());
        } catch (InterruptedException e) {
            log.error("startNagios_{}", e.getMessage());
        }
        startTimeTask(nagios);
    }

    /**
     * singlePublishPause
     *
     * @param sourceTarget sourceTarget
     * @return MonitorResult MonitorResult
     * @throws SchedulerException SchedulerException
     */
    @Override
    public MonitorResult singlePublishPause(SysSourceTarget sourceTarget) {
        SysConfig sysConfig = configMapper.getConfigByid(sourceTarget.getDataSourceId());
        if (sysConfig == null) {
            return MonitorResult.error("没有该主机信息");
        }
        List<Long> jobs = sourceTarget.getJobIds();
        // 需要删除的job集合
        List<SysJob> sysJobs = jobMapper.selectBatchJobByIds(jobs);
        stopTimeTask(sysJobs);
        // 处理oldSysJob修改column
        // 删除
        List<String> remove = dealOldSysJob(sysJobs, sysConfig.getConnectName());
        MonitorManager.mine().work(AsyncFactory.removeRegistry(remove));
        SysSourceTarget sysSourceTarget = sourceTargetMapper.sysSourceTargetById(sourceTarget.getDataSourceId());
        if (ObjectUtil.isNotEmpty(sysSourceTarget)) {
            List<Long> old = sysSourceTarget.getJobIds();
            List<Long> delete = sourceTarget.getJobIds();
            if (old != null && CollectionUtil.isNotEmpty(old)) {
                old.removeAll(delete);
                sysSourceTarget.setJobIds(old);
                sourceTargetMapper.save(sysSourceTarget);
            }
        }
        List<SysJob> otherSysJob = sourceTargetMapper.getMoreThanOneSource(sysJobs);
        startTimeTask(otherSysJob);
        return MonitorResult.success("停止发布成功");
    }

    /**
     * startTimeTask
     *
     * @param sysJobs sysJobs
     * @return int int
     */
    private int startTimeTask(List<SysJob> sysJobs) {
        int num = 0;
        try {
            if (CollectionUtil.isNotEmpty(sysJobs)) {
                for (SysJob sysJob : sysJobs) {
                    MonitorManager.mine().work(
                            AsyncFactory.executeOne(sysJob.getTarget(), sysJob.getJobName(), sysJob.getJobId()));
                    sysJob.setStatus(ScheduleCommon.Status.NORMAL.getValue());
                    num = resumeJob(sysJob);
                }
            }
        } catch (SchedulerException e) {
            log.error("startTimeTask-->{}", e.getMessage());
        }
        return num;
    }

    private int stopTimeTask(List<SysJob> sysJobs) {
        int num = 0;
        try {
            if (CollectionUtil.isNotEmpty(sysJobs)) {
                for (SysJob sysJob : sysJobs) {
                    sysJob.setStatus(ScheduleCommon.Status.PAUSE.getValue());
                    num = pauseJob(sysJob);
                }
            }
        } catch (SchedulerException e) {
            log.error("stopTimeTask-->{}", e.getMessage());
        }
        return num;
    }

    private List<String> dealOldSysJob(List<SysJob> sysJobs, String name) {
        List<String> remove = new ArrayList<>();
        if (CollectionUtil.isEmpty(sysJobs)) {
            return remove;
        }
        for (SysJob sysJob : sysJobs) {
            if (ObjectUtil.isNotEmpty(sysJob)) {
                List<String> column = sysJob.getColumn();
                if (CollectionUtil.isNotEmpty(column)) {
                    column = column.stream().map(item -> item + name).collect(Collectors.toList());
                    remove.addAll(column);
                }
            }
        }

        return remove;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int pauseJob(SysJob job) throws SchedulerException {
        Long jobId = job.getJobId();
        String jobGroup = job.getJobGroup();
        job.setStatus(ScheduleCommon.Status.PAUSE.getValue());
        int rows = jobMapper.updateJob(job);
        scheduler.pauseJob(MonitorTaskUtils.getMonitorWorkKey(jobId, jobGroup));
        return rows;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int resumeJob(SysJob job) throws SchedulerException {
        Long jobId = job.getJobId();
        String jobGroup = "DEFAULT";
        int rows = jobMapper.updateJob(job);
        scheduler.resumeJob(MonitorTaskUtils.getMonitorWorkKey(jobId, jobGroup));
        return rows;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteTask(SysJob task) {
        Long jobId = task.getJobId();
        String jobGroup = task.getJobGroup();
        Boolean isDelete = jobMapper.deleteJobByIds(Arrays.asList(jobId));
        if (isDelete) {
            try {
                scheduler.deleteJob(MonitorTaskUtils.getMonitorWorkKey(jobId, jobGroup));
            } catch (SchedulerException exception) {
                log.error("deleteTask-->{}", exception.getMessage());
            }
        }
        return isDelete;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTaskByIds(Long[] jobIds) {
        // 删除
        for (Long jobId : jobIds) {
            SysJob job = jobMapper.selectJobById(jobId);
            deleteTask(job);
            MonitorManager.mine().work(AsyncFactory.removeJobId(jobId));
            if (!job.getPlatform().equals(ConmmonShare.NAGIOS)) {
                List<Long> sourceId = sourceTargetMapper.getSourceIdByJobId(jobId);
                List<SysConfig> sysConfigs = configMapper.getBatchById(sourceId);
                dealExec(sysConfigs, job);
            }
        }
    }

    private void dealExec(List<SysConfig> sysConfigs, SysJob job) {
        if (CollectionUtil.isNotEmpty(sysConfigs)) {
            for (SysConfig sysConfig : sysConfigs) {
                if (ObjectUtil.isNotEmpty(job)
                        && ObjectUtil.isNotEmpty(sysConfig)
                        && ObjectUtil.isNotEmpty(sysConfig.getConnectName())) {
                    List<String> remove = dealOldSysJob(Arrays.asList(job), sysConfig.getConnectName());
                    MonitorManager.mine().work(AsyncFactory.removeRegistry(remove));
                }
            }
        }
    }

    private void deleteRelation(Long jobId) {
        sourceTargetMapper.removeJobids(jobId);
    }

    @Override
    public ResponseVO checkJobIds(Long[] jobIds) {
        for (Long jobId : jobIds) {
            List<Long> sourceId = sourceTargetMapper.getSourceIdByJobId(jobId);
            if (CollectionUtil.isNotEmpty(sourceId)) {
                List<SysConfig> sysConfigs = configMapper.getBatchById(sourceId);
                List<String> nameList = sysConfigs.stream().map(SysConfig::getConnectName).collect(Collectors.toList());
                return ResponseVO.successResponseVO("检测到指标已在"
                        + nameList + "实例中发布,将批量从实例中删除,是否继续?");
            }
        }
        return ResponseVO.successResponseVO("");
    }

    @Override
    public MonitorResult batchPublishPause(TargetSource targetSource) throws SchedulerException {
        if (ObjectUtil.isEmpty(targetSource)
                || CollectionUtil.isEmpty(targetSource.getDataSourceId())
                || CollectionUtil.isEmpty(targetSource.getJobIds())) {
            return MonitorResult.error("发布信息不能为空");
        }
        List<SysSourceTarget> list = new ArrayList<>();
        List<Long> dateSource = targetSource.getDataSourceId();
        for (Long id : dateSource) {
            SysSourceTarget sourceTarget = new SysSourceTarget();
            sourceTarget.setDataSourceId(id);
            sourceTarget.setJobIds(targetSource.getJobIds());
            list.add(sourceTarget);
        }
        for (SysSourceTarget sourceTarget : list) {
            singlePublishPause(sourceTarget);
        }
        return MonitorResult.success("批量发布停止成功");
    }

    @Override
    public ResponseVO selectGroup() {
        return ResponseVO.successResponseVO(jobMapper.getGroup());
    }

    /**
     * executeZabbix
     *
     * @param zabbix       zabbix
     * @param sysConfig    sysConfig
     * @param zabbixConfig zabbixConfig
     */
    public void executeZabbix(List<SysJob> zabbix, SysConfig sysConfig, SysConfig zabbixConfig) {
        // 插入主机sql
        synchronized (this) {
            String name = sysConfig.getConnectName();
            JdbcTemplate openGaussTemplate = commonService.getTem(sysConfig);
            if (ObjectUtil.isNotEmpty(zabbixConfig)
                    && StrUtil.isNotBlank(zabbixConfig.getContainerPort())
                    && StrUtil.isNotBlank(zabbixConfig.getContainerIp())) {
                ZabbixMessge zabbixMessge = zabbixService.insertNecessary(
                        name, zabbixConfig.getContainerIp(), zabbixConfig.getContainerPort());
                zabbixService.insertTarget(zabbixMessge, zabbix, openGaussTemplate);
            }
        }
    }

    /**
     * run
     *
     * @param job 调度信息
     * @throws SchedulerException SchedulerException
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void start(SysJob job) {
        Long jobId = job.getJobId();
        String jobGroup = job.getJobGroup();
        SysJob properties = jobMapper.selectJobById(job.getJobId());
        // 参数
        JobDataMap dataMap = new JobDataMap();
        dataMap.put(ScheduleCommon.MONITOR_PROPERTIES, properties);
        try {
            scheduler.triggerJob(MonitorTaskUtils.getMonitorWorkKey(jobId, jobGroup), dataMap);
        } catch (SchedulerException exception) {
            log.error("start-->{}", exception.getMessage());
        }
    }

    /**
     * insertJob
     *
     * @param job 调度信息
     * @return MonitorResult MonitorResult
     * @throws SchedulerException SchedulerException
     * @throws TaskException      TaskException
     */
    @Override
    public MonitorResult insertTask(SysJob job) {
        if (job.getTargetGroup().equalsIgnoreCase(ConmmonShare.SYSTEMTARGET) && !job.getIsCreate()) {
            modifyDefault(job);
            return MonitorResult.success("修改成功");
        }
        if (ObjectUtil.isEmpty(job) || ObjectUtil.isEmpty(job.getDataSourceId())) {
            return MonitorResult.error("验证主机信息不能为空");
        }
        if (job.getIsCreate() && job.getTargetGroup().equalsIgnoreCase(ConmmonShare.SYSTEMTARGET)) {
            return MonitorResult.error("自定义分组不能是系统默认分组,请更换分组名称");
        }
        String res = checkConfig(job);
        if (StrUtil.isNotEmpty(res)) {
            return MonitorResult.error(res);
        }
        // 重复性校验
        List<SysJob> sysJobs = jobMapper.selectJobAll();
        Integer max = dealMax(sysJobs) + 1;
        if (job.getIsCreate()) {
            job.setJobName(job.getJobName() + max);
        }
        String message = checkTarget(job, sysJobs);
        if (StrUtil.isNotBlank(message)) {
            return MonitorResult.error(message);
        }
        checkNum(job);
        SysConfig sysConfig = getCheckConfig(job);
        if (sysConfig == null) {
            return MonitorResult.error("请先配置数据源");
        }
        DriverManagerDataSource dataSource = getDataSource(sysConfig);
        jdbcTemplate = new JdbcTemplate(dataSource);
        List<Map<String, Object>> list = null;
        try {
            list = commonService.executeSql(jdbcTemplate, job.getTarget());
        } catch (DataAccessException exception) {
            return MonitorResult.error(exception.getMessage());
        }
        if (CollectionUtil.isEmpty(list) && ObjectUtil.isNotEmpty(job.getIsFalse()) && !job.getIsFalse()) {
            return MonitorResult.target("无法生成指标");
        }
        // 遍历map
        dealSysJob(job, list, sysConfig);
        int rows = jobMapper.insertJob(job);
        if (rows > 0) {
            MonitorTaskUtils.createMonitorJob(scheduler, job);
        }
        return MonitorResult.success("保存成功");
    }

    private String checkConfig(SysJob job) {
        SysConfig zabbixConfig = configMapper.getZabbixConfig();
        SysConfig nagiosConfig = configMapper.getNagiosConfig();
        if (ObjectUtil.isEmpty(zabbixConfig) && job.getPlatform().equals(ConmmonShare.ZABBIX)
                && !job.getTargetGroup().equalsIgnoreCase(ConmmonShare.SYSTEMTARGET)) {
            return "请先配置Zabbix数据源信息";
        }
        if (ObjectUtil.isEmpty(nagiosConfig) && job.getPlatform().equals(ConmmonShare.NAGIOS)
                && !job.getTargetGroup().equalsIgnoreCase(ConmmonShare.SYSTEMTARGET)) {
            return "请先配置Nagios配置信息";
        }
        return "";
    }

    private SysConfig getCheckConfig(SysJob job) {
        List<SysConfig> sysConfigs = configMapper.getAllConfig()
                .stream().filter(item -> item.getPlatform().equals(ConmmonShare.PROM)).collect(Collectors.toList());
        SysConfig sysConfig = sysConfigs.stream().filter(item -> ObjectUtil.isNotEmpty(item.getDataSourceId())
                && item.getDataSourceId().equals(job.getDataSourceId())).findFirst().orElse(null);
        if (sysConfig != null) {
            sysConfig.setPassword(Base64.decode(sysConfig.getPassword()));
        }
        return sysConfig;
    }

    private Integer dealMax(List<SysJob> sysJobs) {
        Integer max = 0;
        if (CollectionUtil.isNotEmpty(sysJobs)) {
            List<String> jobName = sysJobs.stream().map(SysJob::getJobName).collect(Collectors.toList());
            List<String> finalName = jobName
                    .stream().map(item -> item.substring(3))
                    .collect(Collectors.toList());
            List<Integer> codesInteger = finalName.stream().map(Integer::parseInt).collect(Collectors.toList());
            max = codesInteger.stream().reduce(Integer::max).get();
        }
        return max;
    }

    private void modifyDefault(SysJob job) {
        checkNum(job);
        String cronExpression = getCron(job.getNum(), job.getTimeType());
        job.setCronExpression(cronExpression);
        int rows = jobMapper.insertJob(job);
        updateSchedulerJob(job, job.getJobGroup());
    }

    /**
     * checkNum
     *
     * @param job job
     */
    private void checkNum(SysJob job) {
        if (ObjectUtil.isNotEmpty(job)
                && ObjectUtil.isNotEmpty(job.getNum())
                && ObjectUtil.isNotEmpty(job.getTimeType())) {
            if (job.getTimeType().equals(ConmmonShare.SECOND) || job.getTimeType().equals(ConmmonShare.MINUTE)) {
                AssertUtil.isTrue(job.getNum() < 0 || job.getNum() > 59, "时间间隔应大于0小于等于59");
            } else if (job.getTimeType().equals(ConmmonShare.HOUR)) {
                AssertUtil.isTrue(job.getNum() < 0 || job.getNum() > 23, "时间间隔应大于0小于等于23");
            } else if (job.getTimeType().equals(ConmmonShare.DAY)) {
                AssertUtil.isTrue(job.getNum() < 0 || job.getNum() > 30, "时间间隔应大于0小于等于30");
            } else if (job.getTimeType().equals(ConmmonShare.WEEK)) {
                AssertUtil.isTrue(job.getNum() < 0 || job.getNum() > 4, "时间间隔应大于0小于等于4");
            } else if (job.getTimeType().equals(ConmmonShare.MONTH)) {
                AssertUtil.isTrue(job.getNum() < 0 || job.getNum() > 12, "时间间隔应大于0小于12");
            } else {
                log.error("checkNum fail");
            }
        }
    }

    /**
     * checkTarget
     *
     * @param job     job
     * @param sysJobs sysJobs
     * @return String String
     */
    private String checkTarget(SysJob job, List<SysJob> sysJobs) {
        String str = SqlUtil.checkDql(job.getTarget());
        if (StrUtil.isNotEmpty(str)) {
            return str;
        }
        String old = "";
        if (ObjectUtil.isNotEmpty(job.getJobId())) {
            SysJob sysJob = jobMapper.selectJobById(job.getJobId());
            if (ObjectUtil.isNotEmpty(sysJob)) {
                old = sysJob.getTarget().replace(" ", "")
                        .replace(FITE, "")
                        .replace(";", "");
            }
        }
        String sql = job.getTarget().replace(" ", "")
                .replace(FITE, "")
                .replace(";", "");
        if (ConmmonShare.PROM.equals(job.getPlatform())) {
            List<String> prom = getProm(sysJobs);
            if (prom.contains(sql) && job.getIsCreate()) {
                return "Prometheus指标重复";
            }
            if (prom.contains(sql) && !job.getIsCreate() && !old.equals(sql)) {
                return "Prometheus指标重复";
            }
        } else if (ConmmonShare.ZABBIX.equals(job.getPlatform())) {
            List<String> zabbix = getZabbix(sysJobs);
            if (zabbix.contains(sql) && job.getIsCreate()) {
                return "Zabbix指标重复";
            }
            if (zabbix.contains(sql) && !job.getIsCreate() && !old.equals(sql)) {
                return "Zabbix指标重复";
            }
        } else {
            List<String> nagios = getNagios(sysJobs);
            if (nagios.contains(sql) && job.getIsCreate()) {
                return "Nagios指标重复";
            }
            if (nagios.contains(sql) && !job.getIsCreate() && !old.equals(sql)) {
                return "Nagios指标重复";
            }
        }
        return "";
    }

    private List<String> getNagios(List<SysJob> sysJobs) {
        List<String> nagios = sysJobs.stream()
                .filter(item -> item.getPlatform().equals(ConmmonShare.NAGIOS)).map(SysJob::getTarget)
                .collect(Collectors.toList());
        nagios = nagios.stream().map(item -> item.replace(" ", "")
                        .replace(FITE, "")
                        .replace(";", ""))
                .collect(Collectors.toList());
        return nagios;
    }

    private List<String> getZabbix(List<SysJob> sysJobs) {
        List<String> zabbix = sysJobs.stream()
                .filter(item -> item.getPlatform().equals(ConmmonShare.ZABBIX)).map(SysJob::getTarget)
                .collect(Collectors.toList());
        zabbix = zabbix.stream().map(item -> item.replace(" ", "")
                .replace(FITE, "")
                .replace(";", "")).collect(Collectors.toList());
        return zabbix;
    }

    private List<String> getProm(List<SysJob> sysJobs) {
        List<String> prom = sysJobs.stream()
                .filter(item -> item.getPlatform().equals(ConmmonShare.PROM)).map(SysJob::getTarget)
                .collect(Collectors.toList());
        prom = prom.stream().map(item -> item.replace(" ", "")
                        .replace(FITE, "")
                        .replace(";", ""))
                .collect(Collectors.toList());
        return prom;
    }

    /**
     * dealSysJob
     *
     * @param sysConfig sysConfig
     * @param sysJob    sysJob
     * @param list      list
     */
    private void dealSysJob(SysJob sysJob, List<Map<String, Object>> list, SysConfig sysConfig) {
        if (sysJob.getIsCreate()) {
            sysJob.setJobId(MonitorFlake.nextId());
        }
        sysJob.setDataSourceId(sysConfig.getDataSourceId());
        sysJob.setStatus(ScheduleCommon.Status.PAUSE.getValue());
        String target = sysJob.getTarget().replace(";", "");
        sysJob.setTarget(target);
        String jobId = sysJob.getJobId() + "L";
        String invokeTarget = "monitorTask.targetParams('" + sysJob.getTarget() + "'" + "#" + "'"
                + sysJob.getJobName() + "'" + "#" + jobId + "$";
        sysJob.setInvokeTarget(invokeTarget);
        String cronExpression = getCron(sysJob.getNum(), sysJob.getTimeType());
        sysJob.setCronExpression(cronExpression);
        sysJob.setCreateBy("admin");
        if (!sysJob.getTargetGroup().equals(ConmmonShare.SYSTEMTARGET)) {
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            String time = simpleDateFormat.format(new Date());
            try {
                sysJob.setCreateTime(simpleDateFormat.parse(time));
            } catch (ParseException e) {
                log.error("ParseException_dealSysJob");
            }
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern(dataPattern);
            LocalDateTime ldt = LocalDateTime.now();
            sysJob.setStartTime(ldt.format(dtf));
            sysJob.setTime(System.currentTimeMillis());
        }
        List<String> columnList = getColumnList(list, sysJob);
        sysJob.setColumn(columnList);
    }

    private List<String> getColumnList(List<Map<String, Object>> list, SysJob sysJob) {
        // 空指针，将value为null的给个默认值
        for (Map<String, Object> maps : list) {
            for (Map.Entry<String, Object> entry : maps.entrySet()) {
                if (ObjectUtil.isEmpty(entry.getValue()) && !entry.getKey().equalsIgnoreCase("toastsize")) {
                    maps.put(entry.getKey(), "default");
                }
                if (ObjectUtil.isEmpty(entry.getValue()) && entry.getKey().equalsIgnoreCase("toastsize")) {
                    maps.put(entry.getKey(), "0");
                }
                if (entry.getValue().toString().startsWith(".")) {
                    String value = "0" + entry.getValue().toString();
                    maps.put(entry.getKey(), value);
                }
            }
        }
        List<String> columnList = new ArrayList<>();
        for (int i = 0; i < list.size(); i++) {
            Map<String, Object> arry = list.get(i);
            Map<String, Object> metric = HandleUtils.getMap(arry);
            dealMetric(metric, i);
            for (Map.Entry<String, Object> entry : arry.entrySet()) {
                if (entry.getValue().toString().matches(ISNUM) || entry.getValue().toString().matches(KEXUE)) {
                    StringBuilder stringBuilder = new StringBuilder();
                    stringBuilder.append(entry.getKey()).append("_").append(sysJob.getJobName()).append("_");
                    columnList.add(stringBuilder.toString());
                }
            }
        }
        return columnList;
    }

    private void dealMetric(Map<String, Object> metric, int num) {
        if (CollectionUtil.isEmpty(metric)) {
            metric.put("instance", "node" + num);
        }
    }

    private String getCron(Integer num, String timeType) {
        String cronExpression = "";
        String time = num.toString();
        if (ConmmonShare.SECOND.equals(timeType)) {
            cronExpression = "0/" + time + " * * * * ?";
        } else if (ConmmonShare.MINUTE.equals(timeType)) {
            cronExpression = "0 */" + time + " * * * ?";
        } else if (ConmmonShare.HOUR.equals(timeType)) {
            cronExpression = "* * 0/" + time + " * * ?";
        } else if (ConmmonShare.DAY.equals(timeType)) {
            cronExpression = "0 0 23 * * ?";
        } else if (ConmmonShare.WEEK.equals(timeType)) {
            cronExpression = "0 0 12 ? * WED";
        } else if (ConmmonShare.MONTH.equals(timeType)) {
            cronExpression = "0 15 10 15 * ?";
        } else if (ConmmonShare.YEAR.equals(timeType)) {
            cronExpression = "0 10,44 14 ? 3 WED";
        } else {
            log.error("getCron fail");
        }
        return cronExpression;
    }

    /**
     * getDataSource
     *
     * @param sysConfig sysConfig
     * @return DriverManagerDataSource source
     */
    public DriverManagerDataSource getDataSource(SysConfig sysConfig) {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setUrl(sysConfig.getUrl());
        dataSource.setUsername(sysConfig.getUserName());
        dataSource.setPassword(sysConfig.getPassword());
        return dataSource;
    }

    /**
     * getJdbcTemplate
     *
     * @param dataSource dataSource
     * @return JdbcTemplate JdbcTemplate
     */
    public JdbcTemplate getJdbcTemplate(DriverManagerDataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    /**
     * executeSql
     *
     * @param jdbcTemplate jdbcTemplate
     * @param sql          sql
     * @return List<Map < String, Object>> list
     */
    public List<Map<String, Object>> executeSql(JdbcTemplate jdbcTemplate, String sql) {
        List<Map<String, Object>> list = new ArrayList<>();
        try {
            list = jdbcTemplate.queryForList(sql);
        } catch (DataAccessException exception) {
            log.error("SysJobServiceImpl_executeSql,{}", exception.getMessage());
        }
        return list;
    }

    /**
     * updateJob
     *
     * @param task 调度信息
     * @return MonitorResult MonitorResult
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public MonitorResult updateTask(SysJob task) {
        if (task == null) {
            return MonitorResult.error("任务为空");
        }
        if (task.getTargetGroup().equalsIgnoreCase(ConmmonShare.SYSTEMTARGET) && task.getTime() > ConmmonShare.DEFAULTERNUM) {
            return MonitorResult.error("分组不能是系统默认分组");
        }
        SysConfig zabbixConfig = configMapper.getZabbixConfig();
        SysConfig nagiosConfig = configMapper.getNagiosConfig();
        if (ObjectUtil.isEmpty(zabbixConfig) && task.getPlatform().equals(ConmmonShare.ZABBIX)) {
            return MonitorResult.error("请先配置Zabbix数据源信息");
        }
        if (ObjectUtil.isEmpty(nagiosConfig) && task.getPlatform().equals(ConmmonShare.NAGIOS)) {
            return MonitorResult.error("请先配置Nagios配置信息");
        }
        MonitorResult MonitorResult = insertTask(task);
        if (MonitorResult.get("code").equals(HttpStatus.HTTP_OK)) {
            jobMapper.deleteJobByIds(Arrays.asList(task.getJobId()));
            insertTask(task);
        }
        List<Long> publishJobIds = sourceTargetMapper.getPublishJobIds();
        if (publishJobIds.contains(task.getJobId())) {
            startTimeTask(Arrays.asList(task));
        }
        return MonitorResult;
    }

    /**
     * updateSchedulerJob
     *
     * @param job      job
     * @param jobGroup jobGroup
     * @throws SchedulerException SchedulerException
     * @throws TaskException      TaskException
     */
    public void updateSchedulerJob(SysJob job, String jobGroup) {
        Long jobId = job.getJobId();
        // 判断是否存在
        JobKey jobKey = MonitorTaskUtils.getMonitorWorkKey(jobId, jobGroup);
        try {
            if (scheduler.checkExists(jobKey)) {
                // 防止创建时存在数据问题 先移除，然后在执行创建操作
                scheduler.deleteJob(jobKey);
            }
        } catch (SchedulerException exception) {
            log.error("updateSchedulerJob-->{}", exception.getMessage());
        }
        MonitorTaskUtils.createMonitorJob(scheduler, job);
    }
}
