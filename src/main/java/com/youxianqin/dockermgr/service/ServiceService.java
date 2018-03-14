package com.youxianqin.dockermgr.service;

import java.util.*;

import com.youxianqin.dockermgr.dao.BaseRoleMapper;
import com.youxianqin.dockermgr.dao.ServiceMapper;
import com.youxianqin.dockermgr.models.BaseRole;
import com.youxianqin.dockermgr.models.Service;
import org.springframework.beans.factory.annotation.Autowired;



@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceMapper serviceMapper;



    @Autowired
    private BaseRoleMapper baseRoleMapper;

    public Service addService(Service service) {
        serviceMapper.addEntity(service);
        return service;
    }
    public List<Service> getServices()  {
        return serviceMapper.getEntity();
    }

    public void deleteService(int serviceId) {
        serviceMapper.deleteEntity(serviceId);
    }

    public Service updateService(Service service){
        serviceMapper.updateEntity(service);
        return service;
    }
}
