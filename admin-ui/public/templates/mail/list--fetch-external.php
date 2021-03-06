<?php
include("../../helpers.php");
?>

<div  ng-controller="Mail__ExternalMailboxListCtrl">
  <form form-status="status" name="emForm" ng-submit="submit(emForm)">

  <table ng-table="tableParams" class="table table-hover" show-group="false">
    <tr ng-repeat="mailbox in $data" ng-class="rowClass[mailbox.id]" ng-dblclick="edit(mailbox)">

      <!-- Column: Menu -->
      <td data-title="''" header-class="menu" class="menu">
        <span>
          <a ng-click="edit(mailbox)" class="icon"><img src="<?=createThemePath("./img/icons/edit.png")?>" alt="Edit" class="edit" /></a>
          <nav>
            <ul class="list-unstyled">
              <li class="edit"><a ng-click="edit(mailbox)">Edit</a></li>  
              <li class="delete"><a ng-click="delete(mailbox)">Delete</a></li>  
            </ul>
          </nav>
        </span>
      </td>

      <!-- Column: E-mail Address -->
      <td data-title="'E-mail Address'" sortable="'email'" header-class="email" class="email">
        <span>{{mailbox.email}}</span>
      </td>

      <!-- Column: User Count -->
      <td data-title="'Local User'" sortable="'displayname'" header-class="displayname" class="displayname">
        <span>
        {{mailbox.displayname}} 
        </span>
      </td>

      <!-- Column: Action -->
      <td data-title="''" header-class="action" class="action">
        &nbsp;
      </td>

    </tr>
 


    <!-- ADD NEW EXTERNAL -->
    <!-- closed -->
    <tr class="new closed" ng-class="rowClass[999]" ng-if="!newMailbox" ng-click="new({})">
      <td class="menu">
        <span class="icon"><img src="<?=createThemePath("./img/icons/add.png")?>" alt="New" /></span>
      </td>
      <td class="email">
        <strong translate>Add external mailbox</strong>
      </td>
      <td class="user"></td>
      <td class="action"></td>
    </tr>
    <!-- opened -->
    <tr class="new opened" ng-class="rowClass[999]" ng-if="newMailbox">
      <td class="menu">
        <a ng-click="new(null)" class="icon"><img src="<?=createThemePath("./img/icons/close.png")?>" alt="Close" /></a>
      </td>
      <td class="email">
        <span class="control control-sm">
          <input type="text" ng-model="newMailbox.email" autofocus class="form-control input-sm" required ng-pattern="regexEmail" validation-icon="'Please specify' | translate " ui-keyup="{'esc':'new(null)'}" />
        </span>
      </td>
      <td class="user">
        <span class="control control-sm">
          <select class="form-control input-sm" ng-model="newMailbox.username" ng-options="u.username as u.displayname for u in users" ng-init="newMailbox.username=users[0].username" required>
          </select>
        </span>
      </td>
      <td class="action">
        <button type="submit" class="btn btn-primary btn-xs" ng-disabled="glForm.$invalid">Add</button>
      </td>
    </tr>


  </table>

  </form>
</div>