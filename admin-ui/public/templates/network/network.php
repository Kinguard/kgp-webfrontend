<header><h1>Network Configuration</h1></header>
<article>


<uib-tabset active="active">
      <uib-tab index="0" heading="{{'Network Settings' | translate}}">
    	<div ng-include="'./templates/network/form--network-settings.html'"></div>
      </uib-tab>
      <uib-tab index="1" heading="{{'Device Name' | translate}}">
  		<div ng-include="'./templates/network/form--opi-name.html'"></div>
      </uib-tab>
      <uib-tab index="2" heading="{{'Auto Port forward' | translate}}">
        <div ng-include="'./templates/network/form--network-ports.html'"></div>
      </uib-tab>
      <uib-tab index="3" heading="{{'Shell Access' | translate}}">
  		<div ng-include="'./templates/network/form--network-shell.html'"></div>
      </uib-tab>
</uib-tabset>

</article>
