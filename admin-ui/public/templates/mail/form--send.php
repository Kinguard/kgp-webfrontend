<div ng-controller="Mail__SendCtrl">
  <form form-status="status" class="form-group-table" name="msForm" ng-submit="submit(msForm)">
    <p class="form-group">
      <label for="ms-useopi"><strong>Send mail directly from your unit</strong><br>(No configuration of ISP relay)</label>
      <span class="control">
        <input type="radio" value="useopi" ng-model="settings.smtpsettings" id="ms-useopi" class="" name="smtp_settings">
      </span>
    </p>
    <p class="form-group">
      <label for="ms-useexternal"><strong>Use OpenProducts External mail server</strong></label>
      <span class="control">
        <input ng-disabled="!system.unitid" type="radio" value="useexternal" ng-model="settings.smtpsettings" id="ms-useexternal" class="" name="smtp_settings">
        <span ng-if="!system.unitid" class="text-center">
          <a href="#!system/moduleproviders">Enable module</a>
        </span>
      </span>
    </p>

    <div ng-if="system.unitid" ng-show="settings.smtpsettings=='useexternal'">

      <p class="form-group">
        <label for="ms-sendexternal" class="subsection">Send mail via OpenProducts servers</label>
        <span class="control">
          <input type="checkbox" ng-model="settings.sendexternal" id="ms-sendexternal" ng-required="settings.smtpsettings=='useexternal' && !settings.receiverelay" ng-disabled="!settings.relaysend">
        </span>
      </p>
      <p class="form-group">
        <label for="ms-receiverelay" class="subsection">Recieve mail via OpenProducts servers</label>
        <span class="control">
          <input type="checkbox" ng-model="settings.receiverelay" id="ms-receiverelay" ng-required="settings.smtpsettings=='useexternal' &&  !settings.sendexternal" ng-disabled="!settings.relayreceive">
        </span>
      </p>
      <p class="form-group" ng-show="settings.smtpsettings=='useexternal' && (!settings.receiverelay && !settings.sendexternal)">
        <label></label>
        <span class="control">
         <span class="alert-danger">Please select at least one option</span>
        </span>
      </p>
      <p class="form-group" ng-hide="settings.relayreceive">
	<label class="alert-warning subsection">Receive via OpenProducts servers only supported on dyndns enabled systems</label>
      </p>
      <hr>
    </div>

    <p class="form-group">
      <label for="ms-usecustom"><strong>Use Custom SMTP Settings</strong></label>
      <span class="control">
        <input type="radio" value="usecustom" ng-model="settings.smtpsettings" id="ms-usecustom" class="" name="smtp_settings">
      </span>
    </p>

    <div ng-show="settings.smtpsettings=='usecustom'">

      <p class="form-group">
        <label for="ms-relay" class="subsection">Outbound SMTP Server</label>
        <span class="control">
          <input type="text" ng-model="settings.relay" id="ms-relay" class="form-control" ng-pattern="regexIPorFQDN()" ng-required="settings.smtpsettings=='usecustom'"  validation-icon="'Invalid value' | translate ">
        </span>
      </p>
      <p class="form-group">
        <label for="ms-username" class="subsection">Username</label>
        <span class="control">
          <input type="text" ng-model="settings.username" id="ms-username" class="form-control">
        </span>
      </p>
      <p class="form-group">
        <label for="ms-password" class="subsection">Password</label>
        <span class="control">
          <input type="password" ng-model="settings.password" id="ms-password" class="form-control">
        </span>
      </p>
      <div class="form-group">
        <label for="ms-port" class="subsection">Port</label>
        <div class="control">
          <div class="row">
            <div class="col-xs-5">
              <input type="text" ng-model="settings.port" id="ms-port" class="form-control input-xs" ng-pattern="/^[0-9]{1,7}$/" validation-icon="'Please specify' | translate ">
            </div>
          </div>
        </div>
      </div>

      <hr>
    </div>


    <p class="form-buttons">
      <button type="submit" class="btn btn-primary">Save Changes</button>
    </p>

      <div form-status-message="invalid" class="alert alert-danger pop">Form is invalid</div>
      <div form-status-message="submitting" class="alert alert-info pop">Saving...</div>
      <div form-status-message="error" class="alert alert-danger pop">An error occurred. Please try again.</div>
      <div form-status-message="success" class="alert alert-success pop">Saved!</div>

  </form>
</div>
