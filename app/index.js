import jQuery from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import ServerStatus from "jsx/server-status";
import ClusterForm from "jsx/cluster-form";
import ClusterList from "jsx/cluster-list";
import Sidebar from "jsx/sidebar";
import {
  statusObservableTimer,
  addClusterSubject, addClusterResult, deleteClusterSubject, deleteClusterResult,
  clusterNames
} from "observable";

jQuery(document).ready(function($){

  ReactDOM.render(
    React.createElement(ServerStatus, {statusObservableTimer}),
    document.getElementById('cr-server-status')
  );

  ReactDOM.render(
    React.createElement(Sidebar, {clusterNames}),
    document.getElementById('cr-sidebar')
  );

  ReactDOM.render(
    React.createElement(ClusterForm, {addClusterSubject, addClusterResult}),
    document.getElementById('cr-cluster-form')
  );

  ReactDOM.render(
    React.createElement(ClusterList, {
      clusterNames,
      deleteSubject: deleteClusterSubject,
      deleteResult: deleteClusterResult
    }),
    document.getElementById('cr-cluster-list')
  );
});
