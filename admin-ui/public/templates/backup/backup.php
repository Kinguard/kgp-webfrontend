<header><h1>Backup Configuration</h1></header>
<article>
<h2 class="mbot1">Backup Settings</h2>
<div class="form-box">

<form class="form-group-table" form-status="status" name="bForm" ng-submit="submit(bForm)">

  <p class="form-group">
    <label for="b-enabled"><strong>Enable Backup</strong></label>
    <span class="control">
      <input type="checkbox" ng-model="settings.enabled" id="b-enabled" class="">
    </span>
  </p>
  <hr>


  <div ng-show="settings.enabled">

    <div class="form-group">
      <label>Location</label>
      <div class="control">
        <div>
          <label for="b-location-op"><input type="radio" ng-model="settings.location" value="op" id="b-location-op" ng-disabled="!system.unitid"> OpenProducts Servers
            <span ng-show="!system.unitid" class="text-center">
              (<a href="#!system/moduleproviders">Enable module</a>)
            </span>
          </label>
        </div>
        <div>
          <label for="b-location-amazon"><input type="radio" ng-model="settings.location" value="amazon" id="b-location-amazon"> Amazon S3</label>
        </div>
        <div>
          <label for="b-location-local"><input type="radio" ng-model="settings.location" value="local" id="b-location-local"> Local</label>
        </div>
      </div>
    </div>
    <div ng-hide=true class="form-group">
      <div class="control-label">Type</div>
      <div class="control">
        <div class="row">
        <label for="b-type-mirror"><input type="radio" ng-model="settings.type" value="mirror" id="b-type-mirror"> Mirror</label>
        <label for="b-type-timeline"><input type="radio" ng-model="settings.type" value="timeline" id="b-type-timeline"> Timeline</label>
        </div>
      </div>
    </div>
    <hr>
    <div class="form-group" ng-show="settings.location == curr_location">
      <div class="control-label">Backup Space</div>
      <div class="control">
        <div ng-show="settings.location =='op' || settings.location =='local'" class="row">
          <div class="col-md-9 col-sm-8 col-xs-7"><uib-progressbar value="progbar_val" type="{{quota.status}}"></uib-progressbar></div>
          <div class="col-md-3 col-sm-4 col-xs-5"><small>{{quota.used | bytes}} / {{quota.total | bytes}}</small></div>
        </div>
        <div ng-show="settings.location =='amazon'" class="row">
          <div class="col-md-3 col-sm-4 col-xs-5">{{quota.used | bytes}} used.</div>
        </div>
      </div>
    </div>
    <div ng-hide=true class="form-group">
      <div class="control-label">Purchase Backup Storage</div>
      <div class="control"><a ng-click="purchase()" class="btn btn-xs btn-primary">Purchase by code</a></div>
    </div>
    <hr ng-show="show_bar">

    <div ng-show="settings.location=='amazon'">
      <p class="form-group">
        <label for="bs-awsbucket">Amazon Bucket to use</label>
        <span class="control">
          <input 
            type="text" 
            ng-model="settings.AWSbucket" 
            name="AWSbucket"
            class="form-control" 
            ng-pattern="regexAWSbucket()"
            ng-minlength="3" ng-maxlength="63"
            validation-icon="'Invalid value' | translate ">
        </span>
      </p>
    </div>
    <div ng-show="settings.location=='amazon'">
      <p class="form-group">
        <label for="bs-awsregion">Amazon region</label>
        <span class="control">
	<select name="AWSregion" class="form-control" required
		ng-options="key as value for (key, value) in settings.AWSregions"
		ng-model="settings.AWSregion">
	</select>
        </span>
      </p>
    </div>
    <div ng-show="settings.location=='amazon'">
      <p class="form-group">
        <label for="bs-awskey">Amazon Access Key</label>
        <span class="control">
          <input 
            type="text" 
            ng-model="settings.AWSkey" 
            name="AWSkey"
            class="form-control" 
            ng-required="settings.location=='amazon'" 
            ng-pattern="regexAWSKey()" 
            validation-icon="'Invalid value' | translate ">
        </span>
      </p>
    </div>
    <div ng-show="settings.location=='amazon'">
      <p class="form-group">
        <label for="bs-awsseckey">Amazon Secret Access Key</label>
        <span class="control">
          <input 
            type="text" 
            ng-model="settings.AWSseckey" 
            name="AWSseckey"
            class="form-control" 
            ng-pattern="regexAWSSecKey()" 
            validation-icon="'Invalid value' | translate "
            placeholder="Never shown, even if it exists">
        </span>
      </p>
    </div>
      <!--
      <p class="form-group" ng-show="bForm.AWSkey.$invalid || AWSkeyIgnore">
        <label></label>
        <span><input type="checkbox" ng-click="awsIgnore()" ng-model="AWSvalidation"> I know I am correct, ignore error</span>
      </p>
      -->

    <div ng-show="backupStatus.info.length">
      <p class="form-group">
        <label class="control-label">Last Backup</label>
        <span class="control" ng-class="['alert', {'alert-danger':backupStatus.status == 'Failed', 'alert-info':backupStatus.status == 'Successful'}]">{{backupStatus.status | capitalize}}: {{backupStatus.date | date:'yyyy-MM-dd HH:mm'}}</span>
      </p>
    </div>

    <div ng-show="backupStatus.info.length" class="form-group">
      <p class="form-group">
        <label class="control-label">Status message</label>
        <span>{{backupStatus.info}}<br><a ng-show="backupStatus.status == 'Failed'" ng-click="showlog = ! showlog">{{showlog ? "Hide" : "Show"}} log</a></span>
      </p>
    </div>

    <div ng-if="showlog" class="form-group">
      <p class="form-group">
        <label class="control-label">Log file content</label>
        <span><pre>{{backupStatus.log}}</pre></span>
      </p>
    </div>


    <hr ng-show="backupStatus.date">

	<p class="form-buttons" style="text-align: left;" ng-click="startBackup()">
		<button type="button" class="btn btn-primary">Manual Start</button>
	</p>

  </div>


  <p class="form-buttons">
    <button type="submit" class="btn btn-primary">Save Changes</button>
  </p>


  <div form-status-message="invalid" class="alert alert-danger pop">Form is invalid</div>
  <div form-status-message="submitting" class="alert alert-info pop">Saving...</div>
  <div form-status-message="error" class="alert alert-danger pop">An error occurred. Please try again.</div>
  <div form-status-message="success" class="alert alert-success pop">Saved!</div>
  <div form-status-message="started" class="alert alert-success pop">Started!</div>


</form>

</div>
</article>
