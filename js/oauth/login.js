define('login',
	['jquery','jso'],
	function($, jso){
		console.log('jso:', jso);
		
		var uri,
			url,
			callback,
			time;
		
		/**
			Sets URI to redirect from provider login page
			a {string} - url for redirect
		*/
		function setRedirectUri(a){
			uri = a;
			if (uri.lastIndexOf('/') === uri.length-1) uri = uri.substr(0,uri.length-1 ); 
			console.log('uri:', uri);
		};
		
		/**
			Sets URI to get saved login info
			a {string} - url of saved token
		*/
		function setRemoteUri(a){
			url = a;
			
			/**
				Sets handler for redirect from current page
			*/
			jso.registerRedirectHandler(function() {
				time = (new Date()).getTime();
				//console.log('nowtime = ', time);
				//console.log('url = ', url);
				
				var loginwindow = window.open(url, 'loginwindow');
				
				var t;
				t = setTimeout(getTokenUpdate, 3000);
				
				function getTokenUpdate(){
					console.log('getTokenUpdate:: invoked');
					$.ajax({
						url: url,
						method: 'POST',
						success: function(msg){
							var data = JSON.parse(msg);
							//console.log('getTokenUpdate:: data= ', data);
							//console.log('getTokenUpdate:: time= ', time, data.time);
							if (time > data.time) t = setTimeout(getTokenUpdate, 3000);
							else {
								console.log('getTokenUpdate:: ', '!!! "ve got the TOKEN', getOauthData);
								console.log('getTokenUpdate:: jso', jso);
								loginwindow.close();
								
								jso.handleToken(
									'google',
									data.data,
									getOauthData
								);
								
							};
						}
					});
				};
			});
		}
		
		/**
			Sets callback function for whole login process 
			data {function} - callback function
		*/
		function ready(data){
			callback = data || function(){};
		}
		
		/**
			Initiates login process 
		*/
		function start(){
			console.log('start:: ', uri, url);
			
			jso.configure({
				"google": {
					client_id: "386015855865-ou88a31uaabqh8fgr0jmcsblokilbb4j.apps.googleusercontent.com",
					redirect_uri: uri,
					authorization: "https://accounts.google.com/o/oauth2/auth",
					isDefault: true
				}
			});
			
			var token = jso.getToken("google", function(token){
				console.log('jso.getToken:: ', token);
				if (token){
					getOauthData(token);
				} else {
					$('#page').html(_.template($('#oauth-template').html()));
					$('#google').on('click', token, getOauthData);
				}
			});
		}	
		
		
		/**
			Gets user info from provider when token is ready 
			data {object}
		*/
		function getOauthData(data){
			// Perform a data request
			if (data.type) var token = data.data;
			else var token = data;
			console.log('getOauthData:: ', token);
			
			$.oajax({
				url: "https://www.googleapis.com/oauth2/v1/userinfo",
				provider: "google",
				allowia: true,
				scopes: ["https://www.googleapis.com/auth/userinfo.profile"],
				dataType: 'json',
				token: token,
				success: callback
			});
			
		}
		
		return {
			start: start,
			ready: ready,
			setRedirectUri: setRedirectUri,
			setRemoteUri: setRemoteUri
		}
});