sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent"
], function (
    Controller,
    MessageToast,
    MessageBox,
    JSONModel,
    UIComponent
) {
    "use strict";

    return Controller.extend("qmportal780.controller.Login", {

        onInit: function () {
            // Nothing required here for now
        },

        onLogin: function () {
            var oView = this.getView();
            var sUser = oView.byId("inpUser").getValue().trim();
            var sPass = oView.byId("inpPass").getValue().trim();

            // -------------------------
            // Basic validation
            // -------------------------
            if (!sUser || !sPass) {
                MessageToast.show("Please enter both username and password");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            // -------------------------
            // Read Login EntitySet
            // -------------------------
            oModel.read("/ZQM780_LOGIN", {
                success: function (oData) {

                    var aResults = oData.results || [];
                    var bLoginSuccess = false;

                    // -------------------------
                    // Validate credentials
                    // -------------------------
                    for (var i = 0; i < aResults.length; i++) {

                        // Debug (keep during testing)
                        console.log(
                            "Checking:",
                            aResults[i].username,
                            aResults[i].password
                        );

                        if (
                            aResults[i].username === sUser &&
                            aResults[i].password === sPass
                        ) {
                            bLoginSuccess = true;
                            break;
                        }
                    }

                    // -------------------------
                    // Success
                    // -------------------------
                    if (bLoginSuccess) {

                        MessageToast.show("Login Successful");

                        // Session model
                        var oSessionModel = new JSONModel({
                            username: sUser,
                            isLoggedIn: true
                        });

                        that.getOwnerComponent().setModel(oSessionModel, "session");

                        // Navigate to Dashboard
                        UIComponent
                            .getRouterFor(that)
                            .navTo("Dashboard");

                    } else {
                        MessageBox.error("Invalid Credentials");
                    }
                },

                error: function () {
                    MessageBox.error("Unable to connect to backend service");
                }
            });
        }
    });
});
