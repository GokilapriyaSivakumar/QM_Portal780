sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("qmportal780.controller.Dashboard", {
        onInit: function () {
            // Check session?
        },

        onPressInspectionLot: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("InspectionLot");
        },

        onPressResultRecording: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("ResultRecording");
        },

        onPressUsageDecision: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("UsageDecision");
        },

        onLogout: function () {
            // Clear session
            this.getOwnerComponent().setModel(null, "session");
            MessageToast.show("Logged out successfully");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Login");
        }
    });
});
