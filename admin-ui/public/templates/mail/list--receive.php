<?php
include("../../helpers.php");
?>

<div ng-controller="Mail__ReceiveListCtrl">
  <form  form-status="status" name="rlForm" ng-submit="submit(rlForm)">
  <div class="table-options">
    <p>
      <label for="rl-group-by" class="text-normal"><small>Group by:</small></label> 
        <select id="rl-group-by" ng-model="groupBy">
          <option value="domain">Domain</option>
          <option value="userDisplayname">Local User</option>
        </select>
    </p>
  </div>

  <table ng-table="tableParams" class="table" show-group="false">
    <tbody >
    <tr ng-repeat-start="group in $groups" class="ng-table-group link" ng-click="group.$hideRows = !group.$hideRows">
      <td class="menu">
        <span class="icon" ng-if="group.$hideRows"><img src="<?=createThemePath("./img/icons/add.png")?>" alt="Show" /></span>
        <span class="icon" ng-if="!group.$hideRows"><img src="<?=createThemePath("./img/icons/minus.png")?>" alt="Hide" /></span>
      </td> 
      <td colspan="{{$columns.length-1}}">
          <strong>{{ group.value }}</strong>
       </td>
    </tr>

    <tr ng-repeat="receiver in group.data" ng-hide="group.$hideRows" ng-class="rowClass[group.id]" ng-repeat-end>

      <!-- Column: Menu -->
      <td data-title="''" header-class="menu" class="menu">
        <span>
          <a ng-click="delete(receiver)" class="icon"><img src="<?=createThemePath("./img/icons/edit.png")?>" alt="Delete" class="edit" /></a>
          <nav>
            <ul class="list-unstyled">
              <li class="delete"><a ng-click="delete(receiver)">Delete</a></li>  
            </ul>
          </nav>
        </span>
      </td>

      <!-- Column: E-mail Address -->
      <td data-title="'E-mail Address'" sortable="'address'" header-class="email" class="email">
        <span>{{receiver.address}}</span>
      </td>

      <!-- Column: User Count -->
      <td data-title="'Local User'" sortable="'userItem.displayname'" header-class="user" class="user">
        <span>
        {{receiver.userDisplayname}}
        </span>
      </td>

      <!-- Column: Action -->
      <td data-title="''" header-class="action" class="action">
        &nbsp;
      </td>

    </tr>
    </tbody>



    <!-- ADD NEW RECEIVER -->
    <!-- closed -->
    <tbody class="new">
    <tr class="new closed" ng-class="rowClass[999]" ng-if="!newReceiver" ng-click="new({})">
      <td class="menu">
        <span class="icon"><img src="<?=createThemePath("./img/icons/add.png")?>" alt="New" /></span>
      </td>
      <td class="email">
        <strong translate>Add new receiver</strong>
      </td>
      <td class="user"></td>
      <td class="action"></td>
    </tr>
    <!-- opened -->
    <tr class="new opened" ng-class="rowClass[999]" ng-if="newReceiver">
      <td class="menu">
        <a ng-click="new(null)" class="icon"><img src="<?=createThemePath("./img/icons/close.png")?>" alt="Close" /></a>
      </td>
      <td class="email">
        <span class="control control-sm">
          <input type="text" ng-model="newReceiver.address" autofocus class="form-control input-sm" required ng-pattern="regexEmail" validation-icon="'Please specify' | translate " ui-keyup="{'esc':'new(null)'}" />
        </span>
      </td>
      <td class="user">
        <span class="control control-sm">
          <select class="form-control input-sm" ng-model="newReceiver.user" ng-options="u.id as u.displayname for u in users" ng-init="newReceiver.user=users[0].id" required>
          </select>
        </span>
      </td>
      <td class="action">
        <button type="submit" class="btn btn-primary btn-xs" ng-disabled="glForm.$invalid">Add</button>
      </td>
    </tr>
    </tbody>

  </table>

  </form>
</div>