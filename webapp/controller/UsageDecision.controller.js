sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    UIComponent,
    History,
    MessageBox
) {
    "use strict";

    return Controller.extend("qmportal780.controller.UsageDecision", {

        onInit: function () {
            var oUsageModel = new JSONModel({});
            this.getView().setModel(oUsageModel, "usage");
        },

        onSearch: function () {
            var sLot = this.byId("inpInspLot").getValue().trim();

            if (!sLot) {
                MessageBox.warning("Please enter Inspection Lot number");
                return;
            }

            var oODataModel = this.getOwnerComponent().getModel();
            var that = this;

            oODataModel.read("/ZQM780_USAGE('" + sLot + "')", {
                success: function (oData) {
                    that.getView().getModel("usage").setData(oData);
                    that.byId("pnlDecision").setVisible(true);
                },
                error: function () {
                    MessageBox.error("Inspection Lot not found");
                    that.byId("pnlDecision").setVisible(false);
                }
            });
        },

        onApprove: function () {
            MessageBox.success("Usage Decision Approved");
            // Backend POST/UPDATE can be added later
        },

        onReject: function () {
            MessageBox.error("Usage Decision Rejected");
            // Backend POST/UPDATE can be added later
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPrev = oHistory.getPreviousHash();

            if (sPrev !== undefined) {
                window.history.go(-1);
            } else {
                UIComponent.getRouterFor(this)
                    .navTo("Dashboard", {}, true);
            }
        }
    });
});
