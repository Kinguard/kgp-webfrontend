<header><h1>System Configuration</h1></header>
<article>


<uib-tabset active="active">
      <uib-tab index="0" heading="{{'Update Settings' | translate}}">
      <div ng-include="'./templates/system/form--system-update.html'"></div>
      </uib-tab>
      <uib-tab index="1" heading="{{'Module Providers' | translate}}">
      <div ng-include="'./templates/system/form--system-moduleproviders.html'"></div>
      </uib-tab>
</uib-tabset>

</article>
