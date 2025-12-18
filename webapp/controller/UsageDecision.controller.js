sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, History, JSONModel) {
    "use strict";

    return Controller.extend("qmportal780.controller.UsageDecision", {
        onInit: function () {
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

            // We need data from INSPECT (Total Qty) and RECORD (Recorded Qty) and USAGE (Current Status)
            // Sequential calls for simplicity

            oModel.read("/ZQM780_INSPECT('" + sLot + "')", {
                success: function (oInspectData) {

                    oModel.read("/ZQM780_RECORD('" + sLot + "')", {
                        success: function (oRecordData) {

                            oModel.read("/ZQM780_USAGE('" + sLot + "')", {
                                success: function (oUsageData) {

                                    // Calculate
                                    var fTotalQty = parseFloat(oInspectData.InspectionLotQty);
                                    var fRecorded = parseFloat(oRecordData.UnrestrictedStk) + parseFloat(oRecordData.BlockedStk) + parseFloat(oRecordData.QualityStk);
                                    var fDiff = fTotalQty - fRecorded;

                                    var bMatch = (Math.abs(fDiff) < 0.001); // Float comparison
                                    var bAlreadyDecided = (oUsageData.UsageDecision === 'Approved' || oUsageData.UsageDecision === 'Rejected');

                                    var oDisplayData = {
                                        InspectionLot: sLot,
                                        InspectionLotQty: fTotalQty,
                                        TotalRecordedQty: fRecorded,
                                        DiffQty: fDiff.toFixed(3), // Format
                                        UsageDecision: oUsageData.UsageDecision,
                                        ActionEnabled: bMatch && !bAlreadyDecided,
                                        QtyState: bMatch ? "Success" : "Error",
                                        DiffState: bMatch ? "Success" : "Error"
                                    };

                                    var oJSONModel = new JSONModel(oDisplayData);
                                    that.getView().setModel(oJSONModel, "usage");
                                    that.getView().byId("pnlDecision").setVisible(true);

                                    if (!bMatch) {
                                        MessageBox.error("Quantities Mismatch! Inspected: " + fRecorded + ", Total: " + fTotalQty);
                                    }
                                },
                                error: function () {
                                    MessageBox.error("Error reading Usage Decision status.");
                                }
                            });
                        },
                        error: function () {
                            MessageBox.error("Error reading Recording data. Maybe no results recorded?");
                        }
                    });
                },
                error: function () {
                    MessageBox.error("Inspection Lot not found.");
                    that.getView().byId("pnlDecision").setVisible(false);
                }
            });
        },

        onApprove: function () {
            this._submitDecision("Approved");
        },

        onReject: function () {
            this._submitDecision("Rejected");
        },

        _submitDecision: function (sDecision) {
            var oModel = this.getOwnerComponent().getModel();
            var oUsageModel = this.getView().getModel("usage");
            var sLot = oUsageModel.getProperty("/InspectionLot");
            var that = this;

            var oUpdateData = {
                InspectionLot: sLot,
                UsageDecision: sDecision
            };

            // Updating ZQM780_USAGE
            oModel.update("/ZQM780_USAGE('" + sLot + "')", oUpdateData, {
                success: function () {
                    MessageToast.show("Usage Decision '" + sDecision + "' Submitted Successfully");
                    // Update local model to reflect change and disable buttons
                    oUsageModel.setProperty("/UsageDecision", sDecision);
                    oUsageModel.setProperty("/ActionEnabled", false);
                },
                error: function () {
                    MessageBox.error("Error submitting decision.");
                }
            });
        }
    });
});
