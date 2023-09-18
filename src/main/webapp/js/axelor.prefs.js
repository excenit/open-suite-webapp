/*
 * Axelor Business Solutions
 *
 * Copyright (C) 2005-2021 Axelor (<http://axelor.com>).
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function() {

  "use strict";

  var ui = angular.module("axelor.ui");

  /** Excenit Customizations**/
  ui.service('TaxService',[function(){

    this.getTaxComputation =async function(taxList,lineList,taxes,url){
      if(taxList != null && lineList != null){
        for(let taxLine of taxList){
          let totalTaxAmount = 0;
          for(let line of lineList){
            let taxLines = null;
            let exTaxTotal = 0;
            if(line.taxLines == null){//Get line details by Id using rest api
              let response = await getLineDetails(url,line);
              let lineData = response.data[0];
              taxLines = lineData.taxLines;
              exTaxTotal = lineData.exTaxTotal;
            }else{//Use current context line details
              taxLines = line.taxLines;
              exTaxTotal = line.exTaxTotal
            }
            for(let someTaxLine of taxLines){
              if(someTaxLine.id == taxLine.id){
                totalTaxAmount = totalTaxAmount + Number(exTaxTotal);
                break;
              }
            }
          }
          let name = taxLine.name.split(":")[0];
          let rate = taxLine.name.split(":")[1];
          let amount = (totalTaxAmount * Number(rate)).toFixed(2);
          taxes.push(new Tax(name,amount));
        }
      }
    }

    var getLineDetails = function (url, line){
      return  $.ajax({
        "url": window.location.origin + url + line.id,
        "method": "GET",
        "timeout": 0
      }).then(function(response){
        return response;
      });
    }
  }]);

  /**End */

  function UserCtrl($scope, $element, $location, DataSource, ViewService) {

    $scope._viewParams = {
      model: 'com.axelor.auth.db.User',
      views: [{name: 'user-preferences-form', type: 'form'}],
      recordId: axelor.config['user.id']
    };

    ui.ViewCtrl($scope, DataSource, ViewService);
    ui.FormViewCtrl($scope, $element);

    $scope.onClose = function() {
      $scope.confirmDirty(doClose);
    };

    var __version = null;

    $scope.$watch('record.version', function recordVersionWatch(value) {
      if (value === null || value === undefined) return;
      if (__version !== null) return;
      __version = value;
    });

    function doClose() {
      if (!$scope.isDirty()) {
        var rec = $scope.record || {};
        axelor.config["user.action"] = rec.homeAction;
      }

      window.history.back();

      if (__version === ($scope.record || {}).version) {
        return;
      }

      setTimeout(function() {
        window.location.reload();
      }, 100);
    }

    $scope.isMidForm = function (elem) {
      return $element.find('form.mid-form').size();
    };

    $scope.setEditable();
    $scope.show();

    $scope.ajaxStop(function () {
      $scope.$applyAsync();
    });
  }

  function AboutCtrl($scope) {
    $scope.appName = axelor.config["application.name"];
    $scope.appDescription = axelor.config["application.description"];
    $scope.appVersion = axelor.config["application.version"];
    $scope.appVersionShort = $scope.appVersion.substring(0, $scope.appVersion.lastIndexOf('.'));
    $scope.appCopyright = axelor.config["application.copyright"];
    $scope.appSdk = axelor.config["application.sdk"];
    $scope.appSdkShort = $scope.appSdk.substring(0, $scope.appSdk.lastIndexOf('.'));
    $scope.appHome = axelor.config["application.home"];
    $scope.appHelp = axelor.config["application.help"];
    $scope.appYear = moment().year();
    $scope.technical = axelor.config['user.technical'];
  }

  function SystemCtrl($scope, $element, $location, $http) {
    if (!axelor.config['user.technical']) {
       window.location.hash = '/about';
       return;
    }

    var promise = null;

    $scope.onRefresh = function () {
      if (promise) {
        return;
      }
      promise = $http.get("ws/app/sysinfo").then(function (res) {
        var info = res.data;
        _.each(info.users, function (item) {
          item.loginTime = moment(item.loginTime).format('L LT');
          item.accessTime = moment(item.accessTime).format('L LT');
        });
        $scope.info = info;
        promise = null;
      });
      return promise;
    };

    $scope.onClose = function () {
      window.history.back();
    };

    $scope.onRefresh();
  }

  /** Excenit Customizations**/
  class Tax{
    constructor(name,amount) {
      this.name = name;
      this.amount = amount;
    }
  }

  /** Excenit Customizations**/
  //Added to show tax amount after saving in invoice
  function InvoiceTaxListCtrl($scope,TaxService){

    $scope.$watch('record.exTaxTotal',function(){
      const URL = "/ws/rest/com.axelor.apps.account.db.InvoiceLine/";
      $scope.taxes = [];
      let invoiceTaxList = $scope.record.invoiceTaxList;
      let invoiceLineList = $scope.record.invoiceLineList;

      TaxService.getTaxComputation(invoiceTaxList,invoiceLineList,$scope.taxes,URL);
    })
  }

  /** Excenit Customizations**/
  function SaleOrderTaxListCtrl($scope,TaxService){

    $scope.$watch('record.exTaxTotal',function(){
      const URL = "/ws/rest/com.axelor.apps.sale.db.SaleOrderLine/";
      $scope.taxes = [];
      let saleOrderTaxList = $scope.record.saleOrderTaxList;
      let saleOrderLineList = $scope.record.saleOrderLineList;

      TaxService.getTaxComputation(saleOrderTaxList,saleOrderLineList,$scope.taxes,URL);

    })
  }

  /** Excenit Customizations**/
  function PurchaseOrderTaxListCtrl($scope,TaxService){

    $scope.$watch('record.exTaxTotal',function(){
      const URL = "/ws/rest/com.axelor.apps.purchase.db.PurchaseOrderLine/";
      $scope.taxes = [];
      let purchaseOrderTaxList = $scope.record.purchaseOrderTaxList;
      let purchaseOrderLineList = $scope.record.purchaseOrderLineList;

      TaxService.getTaxComputation(purchaseOrderTaxList,purchaseOrderLineList,$scope.taxes,URL);

    })
  }
  /**End */

  ui.controller("UserCtrl", ['$scope', '$element', '$location', 'DataSource', 'ViewService', UserCtrl]);
  ui.controller("SystemCtrl", ['$scope', '$element', '$location', '$http', SystemCtrl]);
  ui.controller("AboutCtrl", ['$scope', AboutCtrl]);

  /** Excenit Customizations**/
  ui.controller("InvoiceTaxListCtrl",['$scope','TaxService',InvoiceTaxListCtrl]); //Added to show tax amount after saving in invoice
  ui.controller("SaleOrderTaxListCtrl",['$scope','TaxService',SaleOrderTaxListCtrl]); //Added to show tax amount after saving in saleOrder
  ui.controller("PurchaseOrderTaxListCtrl",['$scope','TaxService',PurchaseOrderTaxListCtrl]); //Added to show tax amount after saving in invoice

})();
