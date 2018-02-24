package com.youxianqin.dockermgr.dao;

import com.youxianqin.dockermgr.models.ReleaseConf;

public interface ReleaseConfMapper {
    int deleteByPrimaryKey(Integer id);

    int insert(ReleaseConf record);

    int insertSelective(ReleaseConf record);

    ReleaseConf selectByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(ReleaseConf record);

    int updateByPrimaryKey(ReleaseConf record);
}