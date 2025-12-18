sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, History, JSONModel) {
    "use strict";

    return Controller.extend("qmportal780.controller.ResultRecording", {
        onInit: function () {
            var oViewModel = new JSONModel({
                editable: true
            });
            this.getView().setModel(oViewModel, "view");
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Dashboard", {}, true);
            }
        },

        onSearch: function () {
            var sLot = this.getView().byId("inpInspLot").getValue();
            if (!sLot) {
                MessageToast.show("Please enter Inspection Lot Number");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            // Read specific record
            var sPath = "/ZQM780_RECORD('" + sLot + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    var oJSONModel = new JSONModel(oData);
                    that.getView().setModel(oJSONModel, "record");
                    that.getView().byId("pnlResult").setVisible(true);

                    // Logic to check if editable: Check if usage decision is done. 
                    // Since I cannot join, I might need to make another call or rely on a field in ZQM780_RECORD.
                    // Assuming ZQM780_RECORD might have a status or I should query ZQM780_USAGE.
                    // For now, I will optimistically check if there is a 'Status' field or similar in oData, 
                    // or I'll do a separate check to ZQM780_USAGE for the same lot.

                    // Let's check ZQM780_USAGE to see if decision exists
                    that._checkUsageDecision(sLot);
                },
                error: function (oError) {
                    MessageBox.error("Inspection Lot not found or error fetching data.");
                    that.getView().byId("pnlResult").setVisible(false);
                }
            });
        },

        _checkUsageDecision: function (sLot) {
            var oModel = this.getOwnerComponent().getModel();
            var that = this;
            var sPath = "/ZQM780_USAGE('" + sLot + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    // If we find it and status is Approved/Rejected, then it's read-only
                    if (oData.UsageDecision === 'Approved' || oData.UsageDecision === 'Rejected') {
                        that.getView().getModel("view").setProperty("/editable", false);
                        MessageToast.show("Usage Decision already taken. Record is Read-Only.");
                    } else {
                        that.getView().getModel("view").setProperty("/editable", true);
                    }
                },
                error: function () {
                    // precise 404 means no decision yet, so editable. 
                    // Any other error we might default to editable or show warning.
                    // Assuming 404/no record means no decision defined yet.
                    that.getView().getModel("view").setProperty("/editable", true);
                }
            });
        },

        onSave: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oRecordModel = this.getView().getModel("record");
            var oData = oRecordModel.getData();
            var that = this;

            var sPath = "/ZQM780_RECORD('" + oData.InspectionLot + "')";

            oModel.update(sPath, oData, {
                success: function () {
                    MessageToast.show("Results Saved Successfully");
                },
                error: function () {
                    MessageBox.error("Error saving results.");
                }
            });
        }
    });
});
