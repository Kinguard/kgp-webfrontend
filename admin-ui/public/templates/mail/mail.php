<header><h1>E-mail Configuration</h1></header>
<article>


<uib-tabset active="active">
      <uib-tab index="2" heading="{{'Mail server config' | translate}}" ng-if="user.isAdmin()">
    	<div ng-include="'./templates/mail/form--send.php'" class="form-box"></div>
      </uib-tab>
      <uib-tab index="0" heading="{{'Local mail accounts' | translate}}">
        <div ng-include="'./templates/mail/list--receive.php'" class="form-box"></div>
      </uib-tab>
      <uib-tab index="1" heading="{{'Remote mail accounts' | translate}}">
  		<div ng-include="'./templates/mail/list--fetch-external.php'" class="form-box"></div>
      </uib-tab>
</uib-tabset>

</article>
