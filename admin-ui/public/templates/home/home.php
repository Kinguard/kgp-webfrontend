<header><h1>System Information</h1></header>
<article>

<h2 class="mbot1">System Status</h2>
<div class="form-box">
  <form class="form-group-table" form-status="status" name="bForm" ng-submit="submit(bForm)">

      <p class="form-group">
        <label class="control-label">System Uptime</label>
        <span class="control">
          {{uptime}}
        </span>
      </p>

    <p class="form-group" ng-if="user.isAdmin()">
      <label class="control-label">Last Backup</label>
      <span class="control" ng-class="[{'alert-danger':backupStatus.status == 'Failed'}]" ng-show=backupStatus.date>{{backupStatus.status | capitalize}}: {{backupStatus.date | date:'yyyy-MM-dd HH:mm'}}</span>
      <span class="control" ng-hide=backupStatus.date>None available</span>

    </p>

    <div class="form-group">
      <label class="control-label">Local Storage</label>
      <div class="control">
        <uib-progressbar value="storage.value" type="storage.status"></uib-progressbar>
        <small>{{ storage.used*1024 | bytes}} / {{storage.all*1024 | bytes}}</small>
      </div>
    </div>

    <p class="form-group" ng-show="temperature">
      <label class="control-label">System Temperature</label>
      <span class="control">
        {{temperature / 1000 | number:1}}&#176;C
      </span>
    </p>

    <p class="form-group" ng-show="unitid">
      <label class="control-label">System ID</label>
      <span class="control">
        {{unitid}}
      </span>
    </p>

    <div class="form-group">
      <label class="control-label">Software Version</label>
      <div class="control">
        <div class="row">
          <div class="col-md-9 col-sm-8 col-xs-7">
            <span>{{osversion}}<br></span>
            <a ng-click="showpkgs = ! showpkgs">{{showpkgs ? "Hide" : "Show more"}} packages</a>
            <div ng-show="showpkgs"> 
            <table class="package-table">
              <tr ng-repeat="(package,version) in packages">
                <td>{{package}}:</td><td>{{version| limitTo : -15 : -4}}</td><td>Status: <span class="pkg-status">{{version| limitTo : 10 : -4}}</span></td>
              </tr>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>

  </form>
</div>
<p><br></p>
<div ng-show="sysmsg_support">
<h2 class="mbot1">System Messages</h2>
  <div class="form-box">
      <div class="form-group" ng-show="messages.length">
        <div class="row message-row">
          <div class="col-md-1 col-sm-1 col-xs-1"></div>
          <div class="col-md-3 col-sm-2 col-xs-3"><strong>Date</strong></div>
          <div class="col-md-4 col-sm-5 col-xs-7"><strong>Content</strong></div>
          <div class="col-md-4 col-sm-3 col-xs-12"></div>
        </div>
        <div class="row message-row" ng-repeat="msg in messages | orderBy:['-date'] " ng-class-odd="'odd-line'">
          <div class="col-md-1 col-sm-1 col-xs-1"><span class="status-icon {{msg.levelText}}"></span></div>
          <div class="col-md-3 col-sm-2 col-xs-3">{{msg.date*1000 | date:'yyyy-MM-dd HH:mm'}}</div>
          <div class="col-md-4 col-sm-5 col-xs-7">{{msg.message | limitTo : MaxMsgLength}}<span ng-show="msg.message.length > MaxMsgLength"> ...</span></div>
          <div class="col-md-4 col-sm-3 col-xs-12">
            <button class="btn btn-primary btn-xs btn-ack" ng-click="ack(msg.id)" ng-show="user.isAdmin()">Acknowledge</button>
            <button ng-show="msg.message.length > MaxMsgLength" ng-show="user.isAdmin()" class="btn btn-primary btn-xs btn-ack" ng-click="viewMessage(msg.id)">Read More</button>
          </div>
        </div>
      </div>


      <div class="form-group" ng-hide="messages.length > 0">
        <div class="row message-row">
          <div class="col-md-6 col-sm-6 col-xs-9">No messages available</div>
        </div>
      </div>

  </div>
</div>
<p><br></p>
<div ng-show="user.isAdmin() && upgrade.available">
<h2 class="mbot1">System upgrade</h2>
<div class="form-box">
<div>
{{upgrade.description}}
</div>
<button class="btn btn-primary" ng-click="startUpgrade()">Start upgrade</button>
</div>
</div>
</article>
