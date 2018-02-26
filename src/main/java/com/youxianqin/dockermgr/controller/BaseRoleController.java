package com.youxianqin.dockermgr.controller;


import com.youxianqin.dockermgr.models.BaseRole;
import com.youxianqin.dockermgr.service.BaseRoleService;
import com.youxianqin.dockermgr.util.ResponseData;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.util.List;

@RestController
@RequestMapping("/api/baserole")
public class BaseRoleController {
    @Inject
    private BaseRoleService baseRoleService;
    @RequestMapping(method = RequestMethod.POST)
    public ResponseData createBaseRole(@RequestBody BaseRole baseRole) {
        ResponseData<BaseRole> response = new ResponseData<BaseRole>();
        response.setData(baseRoleService.createBaseRole(baseRole));
        return response;
    }
    @RequestMapping(method = RequestMethod.GET)
    public ResponseData getBaseRoles() {
        ResponseData<List<BaseRole>> response = new ResponseData<List<BaseRole>>();
        response.setData(baseRoleService.getBaseRoleList());
        return response;
    }
    @RequestMapping(value = "/{baseRoleId}",method = RequestMethod.DELETE)
    public ResponseData deleteBaseRole(@PathVariable int baseRoleId) {
        ResponseData response = new ResponseData();
        baseRoleService.deleteBaseRole(baseRoleId);
        return response;
    }
    @RequestMapping(method = RequestMethod.PUT)
    public ResponseData updateBaseRole(@RequestBody BaseRole baseRole) {
        ResponseData<BaseRole> response = new ResponseData<BaseRole>();
        baseRoleService.updateBaseRole(baseRole);
        response.setData(baseRole);
        return response;
    }
}