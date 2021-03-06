<?php
include("../../helpers.php");
?>

<div ng-controller="Users__UserListCtrl">
  <form form-status="status" name="ulForm" ng-submit="submit(ulForm)">
  <table ng-table="tableParams" class="table table-striped">
    <tr ng-repeat="user in $data" ng-dblclick="edit(user,true)" ng-class="rowClass[user.id]">

      <!-- Column: Menu -->
      <td data-title="''" header-class="menu" class="menu">
        <span ng-if="!editing(user)">
          <a ng-click="edit(user)" class="icon"><img src="<?=createThemePath("./img/icons/edit.png")?>" alt="Edit" class="edit" /></a>
          <nav>
            <ul class="list-unstyled">
              <li class="edit"><a ng-click="edit(user)">Edit</a></li>
              <li class="chg-pwd"><a ng-click="changePassword(user)">Change Password</a></li>
              <li class="groups"><a ng-click="groups(user)">Manage Groups</a></li>
              <li class="delete split" ng-hide="user.username == whoami()"><a ng-click="delete(user)">Delete</a></li>  
            </ul>
          </nav>
        </span>
        <span ng-if="editing(user)">
          <a ng-click="edit({})" class="icon"><img src="<?=createThemePath("./img/icons/close.png")?>" alt="Close" class="close-edit" /></a>
        </span>
      </td>

      <!-- Column: Display Name -->
      <td data-title="'Display Name'" sortable="'displayname'" header-class="displayname" class="displayname">
        <span ng-if="!editing(user)">
        {{user.displayname}}
        </span>
        <span ng-if="editing(user)" class="control control-sm">
          <input type="text" ng-model="editUser.displayname" autofocus class="form-control input-sm" required validation-icon="'Please specify' | translate " ui-keyup="{'esc':'edit({})'}" />
        </span>
      </td>

      <!-- Column: Username -->
      <td data-title="'Username'" sortable="'username'" header-class="username" class="username">
        <span>  
        {{user.username}}
        </span>
        <!-- <span ng-if="!editing(user)">  
        {{user.username}}
        </span>
        <span ng-if="editing(user)" class="control control-sm">
          <input type="text" ng-model="editUser.username" class="form-control input-sm" required validation-icon="'Please specify' | translate " ui-keyup="{'esc':'edit({})'}" />
        </span>
        -->
      </td>

      <!-- Column: Type -->
      <td data-title="'Groups'" sortable="'groups'" header-class="group" class="group">
        <span>{{getUserGroups(user).join(", ")}}</span>
      </td>

      <!-- Column: Action -->
      <td data-title="''" header-class="action" class="action">
        <span ng-if="editing(user)">
          <button type="submit" class="btn btn-primary btn-xs" ng-disabled="ulForm.$invalid">Save</button>
        </span>
      </td>

    </tr>

    <!-- ADD NEW USER -->
    <!-- closed -->
    <tr class="new closed" ng-class="rowClass[999]" ng-if="!newUser" ng-click="new({})">
      <td class="menu">
        <span class="icon"><img src="<?=createThemePath("./img/icons/add.png")?>" alt="New" /></span>
      </td>
      <td class="displayname">
        <strong translate>Add new user</strong>
      </td>
      <td class="username"></td>
      <td class="type"></td>
      <td class="action"></td>
    </tr>
    <!-- opened -->
    <tr class="new opened" ng-class="rowClass[999]" ng-if="newUser">
      <td class="menu">
        <a ng-click="new(null)" class="icon"><img src="<?=createThemePath("./img/icons/close.png")?>" alt="Close" /></a>
      </td>
      <td class="displayname">
        <span class="control control-sm">
          <input type="text" ng-model="newUser.displayname" autofocus class="form-control input-sm" required validation-icon="'Please specify' | translate " ui-keyup="{'esc':'new(null)'}" />
        </span>
      </td>
      <td class="username">
        <span class="control control-sm">
          <input type="text" ng-model="newUser.username" class="form-control input-sm" ng-pattern="regexUsername()" required validation-icon="'Please specify' | translate " ui-keyup="{'esc':'new(null)'}" />
        </span>
      </td>
      <td class="type">
      </td>
      <td class="action">
        <button type="submit" class="btn btn-primary btn-xs" ng-disabled="ulForm.$invalid">Create</button>
      </td>
    </tr>


  </table>
  </form>
</div>