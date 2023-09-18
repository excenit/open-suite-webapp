<%--

    Axelor Business Solutions

    Copyright (C) 2005-2023 Axelor (<http://axelor.com>).

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

--%>
<%@ taglib prefix="x" uri="WEB-INF/axelor.tld" %>
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page language="java" session="true" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Map.Entry"%>
<%@ page import="java.util.Set" %>
<%@ page import="org.pac4j.http.client.indirect.FormClient" %>
<%@ page import="com.axelor.inject.Beans" %>
<%@ page import="com.axelor.auth.pac4j.AuthPac4jInfo" %>
<%@ page import="com.axelor.common.HtmlUtils" %>
<%@ page import="com.axelor.app.AppSettings" %>
<%@ page import="com.axelor.restapi.RestApiSettings" %>
<%@include file='common.jsp'%>
<%

String errorMsg = T.apply(request.getParameter(FormClient.ERROR_PARAMETER));

String loginRemember = T.apply("Remember me");
String loginSubmit = T.apply("Log in");

String loginUserName = T.apply("Username");
String loginPassword = T.apply("Password");

String warningBrowser = T.apply("Update your browser!");
String warningAdblock = T.apply("Adblocker detected!");
String warningAdblock2 = T.apply("Please disable the adblocker as it may slow down the application.");

String loginWith = T.apply("Log in with %s");

String loginHeader = "/login-header.jsp";
if (pageContext.getServletContext().getResource(loginHeader) == null) {
  loginHeader = null;
}

@SuppressWarnings("all")
Map<String, String> tenants = (Map) session.getAttribute("tenantMap");
String tenantId = (String) session.getAttribute("tenantId");

AuthPac4jInfo authPac4jInfo = Beans.get(AuthPac4jInfo.class);
String callbackUrl = authPac4jInfo.getCallbackUrl();
Set<String> centralClients = authPac4jInfo.getCentralClients();

AppSettings settings = AppSettings.get();
String baseUrl = settings.getBaseURL();

RestApiSettings restApiSettings = RestApiSettings.get();
String restApiUsername = restApiSettings.get("rest-api.username");
String restApiPassword = restApiSettings.get("rest-api.password");

%>
<!DOCTYPE html>
<html lang="<%= pageLang %>">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="google" content="notranslate">
    <link rel="shortcut icon" href="ico/favicon.ico">
    <x:style src="css/application.login.css" />
    <x:script src="js/application.login.js" />
  </head>
  <body>

    <% if (loginHeader != null) { %>
    <jsp:include page="<%= loginHeader %>" />
    <% } %>

    <div class="container-fluid">
      <div class="panel login-panel">
        <div class="panel-header panel-default">
          <img src="<%= appLogo %>" width="192px">
        </div>

        <div id="error-msg" class="alert alert-block alert-error text-center <%= errorMsg == null ? "hidden" : "" %>">
          <h4><%= HtmlUtils.escape(errorMsg) %></h4>
        </div>

        <% if (!centralClients.isEmpty()) { %>
        <div id="social-buttons" class="form-fields text-center">
          <% for (String client : centralClients) { %>
            <%
            Map<String, String> info = authPac4jInfo.getClientInfo(client);
            String title = info.get("title");
            String icon = info.get("icon");
            %>
            <button class="btn" type="button" data-provider="<%= client %>">
              <% if (icon != null) { %>
              <img class="social-logo <%= client %>" src="<%= icon %>" alt="<%= title %>" title="<%= title %>">
              <% } %>
              <div class="social-title"><%= String.format(loginWith, title) %></div>
            </button>
            <% } %>
          </div>
        <% } %>

        <div class="panel-body">
          <form id="login-form" action="<%=callbackUrl%>" method="POST">
            <div class="form-fields">
              <div class="input-prepend">
                <span class="add-on"><i class="fa fa-envelope"></i></span>
                <input type="text" id="usernameId" name="username" placeholder="<%= loginUserName %>" autofocus="autofocus">
              </div>
              <div class="input-prepend">
                <span class="add-on"><i class="fa fa-lock"></i></span>
                <input type="password" id="passwordId" name="password" placeholder="<%= loginPassword %>">
              </div>
              <!-- Hide section hides and shows password-->
              <div class="fit-in-password">
                <span id="iconShowPassword">
                  <i class="fa fa-eye" aria-hidden="true"></i>
                </span>
                <span id="iconHidePassword">
                  <i class="fa fa-eye-slash" aria-hidden="true"></i>
                </span>
              </div>
              <% if (tenants != null && tenants.size() > 1) { %>
              <div class="input-prepend">
                <span class="add-on"><i class="fa fa-database"></i></span>
                <select name="tenantId">
                <% for (String key : tenants.keySet()) { %>
                  <option value="<%= key %>" <%= (key.equals(tenantId) ? "selected" : "") %>><%= tenants.get(key) %></option>
                <% } %>
                </select>
              </div>
              <% } %>
              <label class="ibox">
                <input type="checkbox" value="rememberMe" name="rememberMe">
                <span class="box"></span>
                <span class="title"><%= loginRemember %></span>
              </label>
              <input type="hidden" name="hash_location" id="hash-location">
            </div>
            <div class="form-footer">
              <button class="btn btn-primary" type="submit"><%= loginSubmit %></button>
              <button class="btn" style="margin-top: 10px;" type="button" id="forgotPasswordBtn">Forgot password?</button>
            </div>
          </form>
          <form id="search-form" method="POST">
              <div class="form-fields">
                <label class="forgotPasswordLabel">Enter your username or email associated with your ERP account</label>
                <div class="input-prepend">
                   <input type="text" id="usernameOrEmail" name="usernameOrEmail" class="search-query" required>
                </div>
              </div>
              <div class="form-footer">
                  <button class="btn btn-primary" type="submit" id="searchPassword">Reset Password</button>
                  <button class="btn btn-primary disabled hidden" type="button" id="searchLoading">
                    Loading <img src="img/loading.gif" class="loading">
                  </button>
              </div>
        </form>
        <div id="emailConfirmationBox">
          <div class="passwordResetInfoBox">
            <h4>Hello <span id="fullName"></span></h4>
            <span id="message">Send a temporary password to <span id="emailAddress"><span></span>
          </div>
          <p id="email-form-footer">
            <span class="form-footer-30">
              <button class="btn btn-danger" type="button" id="notYouButton">Not You ?</button>
            </span>
            <span class="form-footer-30">
                <button class="btn btn-primary" type="button" id="sendEmailButton">Send</button>
            </span>
            <button class="btn btn-primary disabled hidden" type="button" id="sendLoading">
              Sending <img src="img/loading.gif" class="loading">
            </button>
          </p>
        </div>
        <div id="passwordReceivedBox">
          <div class="passwordResetInfoBox">
             A temporary password to was sent to the email address <span id="passwordReceivedEmailAddress"><span>
          </div>
          <div class="passwordResetInfoBox">
              Please check your mail to confirm. If you didn't received the password, click on
              <span style="font-style: italic; color: red;">Resend button</span> to resend the password,
              otherwise click on the <span style="font-style: italic; color: red;">Login button</span> to
              login with the new password
          </div>
          <p id="email-form-footer">
            <span class="form-footer-30">
              <button class="btn btn-inverse" type="button" id="resendButton">Resend</button>
            </span>
            <span class="form-footer-30">
                <button class="btn btn-primary" type="button" id="loginButton">Login</button>
            </span>
            <button class="btn btn-primary disabled hidden" type="button" id="resendLoading">
              Sending <img src="img/loading.gif" class="loading">
            </button>
          </p>
        </div>
      </div>
      <div id="br-warning" class="alert alert-block alert-error hidden">
      <h4><%= warningBrowser %></h4>
      <ul>
        <li>Chrome</li>
        <li>Firefox</li>
        <li>Safari</li>
        <li>IE >= 11</li>
      </ul>
    </div>
    <div id="ad-warning" class="alert hidden">
      <h4><%= warningAdblock %></h4>
      <div><%= warningAdblock2 %></div>
    </div>
    </div>

    <footer class="container-fluid text-center">
      <p class="credit small"><%= appCopyright %></p>
    </footer>

    <div id="adblock"></div>

    <script type="text/javascript">
    $(function () {

      var userId;
      var emailAddress;
      const browser = bowser.getParser(window.navigator.userAgent);

      if(browser.getBrowser().name === "Microsoft Edge"){
        $('#iconShowPassword').hide(); //Hide the show password button
        $('#iconHidePassword').hide(); //Hide the hide password button
      }else{
         $('#iconHidePassword').hide(); //Hide the hide password button
      }

      $('#search-form').hide();
      $('#emailConfirmationBox').hide();
      $("#passwordReceivedBox").hide();

      if (axelor.browser.msie && !axelor.browser.rv) {
         $('#br-warning').removeClass('hidden');
      }
      if ($('#adblock') === undefined || $('#adblock').is(':hidden')) {
         $('#ad-warning').removeClass('hidden');
      }

      $("#social-buttons").on('click', 'button', function (e) {
       var client = $(e.currentTarget).data('provider');
       window.location.href = './?force_client=' + client
           + "&hash_location=" + encodeURIComponent(window.location.hash);
      });

        $('#login-form').submit(function(e) {
          document.getElementById("hash-location").value = window.location.hash;
        });

        function getCookies() {
            return decodeURIComponent(document.cookie)
              .split('; ')
              .reduce((acc, cur) => { const [k, v] = cur.split('='); return {...acc, [k]: v}; }, {});
        }
    });
        </script>
  </body>
</html>
