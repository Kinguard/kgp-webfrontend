<?php
include("../../helpers.php");
?>

<div ng-controller="Groups__GroupListCtrl">
<form form-status="status" name="glForm" ng-submit="submit(glForm)">
<table ng-table="tableParams" class="table table-striped">
  <tr ng-repeat="group in $data" ng-dblclick="edit(group,true)" ng-class="rowClass[group.id]">

    <!-- Column: Menu -->
    <td data-title="''" header-class="menu" class="menu">
      <span ng-if="!editing(group)">
        <a ng-click="edit(group)" class="icon"><img src="<?=createThemePath("./img/icons/edit.png")?>" alt="Edit" class="edit" /></a>
        <nav>
          <ul class="list-unstyled">
            <!--li class="edit"><a ng-click="edit(group)">Edit</a></li-->
            <li class="users"><a ng-click="users(group)">Manage Users</a></li>
            <li class="delete split"><a ng-click="delete(group)">Delete</a></li>  
          </ul>
        </nav>
      </span>
      <span ng-if="editing(group)">
        <a ng-click="edit({})" class="icon"><img src="<?=createThemePath("./img/icons/close.png")?>" alt="Close" class="close-edit" /></a>
      </span>
    </td>

    <!-- Column: Group Name -->
    <td data-title="'Group Name'" sortable="'name'" header-class="groupname" class="groupname">
      <span ng-if="!editing(group)">
      {{group.name}}
      </span>
      <span ng-if="editing(group)" class="control control-sm">
        <input type="text" ng-model="editGroup.name" autofocus class="form-control input-sm" required validation-icon="'Please specify' | translate " ui-keyup="{'esc':'edit({})'}" />
      </span>
    </td>

    <!-- Column: User Count -->
    <td data-title="'Users'" sortable="'users.length'" header-class="user-count" class="user-count">
      <span>
      {{usernamesInGroup(group).join(', ')}}
      </span>
    </td>

    <!-- Column: Action -->
    <td data-title="''" header-class="action" class="action">
      <span ng-if="editing(group)">
        <button type="submit" class="btn btn-primary btn-xs" ng-disabled="glForm.$invalid">Save</button>
      </span>
    </td>

  </tr>

  <!-- ADD NEW GROUP -->
  <!-- closed -->
  <tr class="new closed" ng-class="rowClass[999]" ng-if="!newGroup" ng-click="new({})">
    <td class="menu">
      <span class="icon"><img src="<?=createThemePath("./img/icons/add.png")?>" alt="New" /></span>
    </td>
    <td class="groupname">
      <strong translate>Add new group</strong>
    </td>
    <td class="users-count"></td>
    <td class="action"></td>
  </tr>
  <!-- opened -->
  <tr class="new opened" ng-class="rowClass[999]" ng-if="newGroup">
    <td class="menu">
      <a ng-click="new(null)" class="icon"><img src="<?=createThemePath("./img/icons/close.png")?>" alt="Close" /></a>
    </td>
    <td class="groupname">
      <span class="control control-sm">
        <input type="text" ng-model="newGroup.group" autofocus class="form-control input-sm" required validation-icon="'Please specify' | translate " ui-keyup="{'esc':'new(null)'}" ng-pattern="/^[a-zA-Z0-9]+$/"/>
      </span>
    </td>
    <td class="users-count">
    </td>
    <td class="action">
      <button type="submit" class="btn btn-primary btn-xs" ng-disabled="glForm.$invalid">Create</button>
    </td>
  </tr>


</table>
</form>
</div>
