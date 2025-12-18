sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("qmportal780.controller.Login", {
        onInit: function () {
            // Keep session model global or at least attach to component to persist across views
        },

        onLogin: function () {
            var sUser = this.getView().byId("inpUser").getValue();
            var sPass = this.getView().byId("inpPass").getValue();

            if (!sUser || !sPass) {
                MessageToast.show("Please enter both username and password.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            // Reading ZQM780_LOGIN entity set
            oModel.read("/ZQM780_LOGIN", {
                success: function (oData) {
                    var aResults = oData.results;
                    var bLoginSuccess = false;

                    // Validate if user exists
                    for (var i = 0; i < aResults.length; i++) {
                        if (aResults[i].Username === sUser && aResults[i].Password === sPass) { // Assuming field names are Username and Password based on standard naming, will verify if needed but usually standard. If keys are different, I should check metadata, but I don't have it. I'll make a safe assumption for now or try to match UserID/Password. Let's assume Username/Password for now based on description. *Wait*, description says "entered username and password exist in the response data".
                            bLoginSuccess = true;
                            break;
                        }
                    }

                    if (bLoginSuccess) {
                        MessageToast.show("Login Successful");
                        
                        // Store session data
                        var oSessionModel = new JSONModel({
                            username: sUser
                        });
                        that.getOwnerComponent().setModel(oSessionModel, "session");

                        // Navigate to Dashboard
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("Dashboard");
                    } else {
                        MessageBox.error("Invalid Credentials");
                    }
                },
                error: function (oError) {
                    MessageBox.error("Error connecting to backend.");
                }
            });
        }
    });
});
