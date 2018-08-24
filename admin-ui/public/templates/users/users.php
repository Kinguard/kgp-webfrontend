<header><h1>Users &amp; Groups</h1></header>
<article>


<uib-tabset active="active">
      <uib-tab index="0" heading="{{'Users' | translate}}">
    	<div ng-include="'./templates/users/list--users.php'" class="form-box"></div>
      </uib-tab>
      <uib-tab index="1" heading="{{'Groups' | translate}}">
        <div ng-include="'./templates/users/list--groups.php'" class="form-box"></div>
      </uib-tab>
</uib-tabset>

</article>