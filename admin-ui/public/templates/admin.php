<section id="admin" ng-controller="AdminCtrl">
  <aside id="panel">
    <h1>
      <span class="logo"><img src="themes/{{sysTheme | lowercase}}/img/logo-{{sysType | lowercase}}-white.png" alt="{{sysType}}" /></span>
      <a ng-click="menu()" class="menu hidden-lg"><span id="menuicon"/></span>
      </a>
    </h1>
    <nav>
      <ul class="list-unstyled">
        <li class="home" ng-class="{ active:isCurrentPath('/') }"><a href="#!/" tooltip="{{tooltip('Home')}}"><i></i><strong>Home</strong></a></li>
        <li class="me" ng-class="{ active:isCurrentPath('/me') }"><a href="#!/me" tooltip="{{tooltip('My Profile')}}"><i></i><strong>My Profile <span>({{user.displayname}})</span></strong></a></li>
        <li class="users" ng-class="{ active:isCurrentPath('/users') }" ng-show="user.isAdmin()"><a href="#!/users" tooltip="{{tooltip('Users &amp; Groups')}}"><i></i><strong>Users &amp; Groups</strong></a></li>
        <li class="mail" ng-class="{ active:isCurrentPath('/mail') }"><a href="#!/mail" tooltip="{{tooltip('E-mail Configuration')}}"><i></i><strong>E-mail Configuration</strong></a></li>
        <li class="network" ng-class="{ active:isCurrentPath('/network') }" ng-show="user.isAdmin()"><a href="#!/network" tooltip="{{tooltip('Network Configuration')}}"><i></i><strong>Network Configuration</strong></a></li>
        <li class="backup" ng-class="{ active:isCurrentPath('/backup') }" ng-show="user.isAdmin()"><a href="#!/backup" tooltip="{{tooltip('Backup Configuration')}}"><i></i><strong>Backup Configuration</strong></a></li>
        <li class="system" ng-class="{ active:isCurrentPath('/system') }" ng-show="user.isAdmin()"><a href="#!/system" tooltip="{{tooltip('System Configuration')}}"><i></i><strong>System Configuration</strong></a></li>
        <li class="help" ng-class="{ active:isCurrentPath('/help') }" ><a href="#!/help" tooltip="{{tooltip('Support and Documentation')}}"><i></i><strong>Support</strong></a></li>
        <li class="shutdown" ng-class="{ active:isCurrentPath('/shutdown') }" ng-show="user.isAdmin()"><a href="#!/shutdown" tooltip="{{tooltip('Shutdown unit')}}"><i></i><strong>System Shutdown</strong></a></li>
        <li class="logout"><a href="#!/logout" ng-click="logout()" tooltip="{{tooltip('Logout')}}"><i></i><strong>Logout</strong></a></li>
      </ul>
    </nav>
  </aside>


  <main ng-view></main>

</section>
