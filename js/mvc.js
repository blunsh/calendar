(function (window){

	/**
	* Creates main object that can handle custom events.
	*/	 
	var mvc = (function (){
		var events = {};
		
		return {
		
			/**
			* Add a callback for custom event.
			* @param  {string} ename name of custom event.
			* @param  {function} callback 
			* @param  {object} scope 
			* @param  {object} args 
			*/	
			subscribe : function subscribe(ename, callback, scope, args){
				scope = scope || window;
				if (!events[ename]) events[ename] = [];
				events[ename].push({
					fun: callback,
					scope: scope,
					name: ename,
					args: args
				});
			},
			
			/**
			* Remove a callback for custom event.
			* @param  {string} ename name of custom event.
			* @param  {function} callback 
			* @param  {object} scope 
			*/	
			unsubscribe : function unsubscribe(ename, callback, scope){
				if (!events[ename]) return;
				for (var i=0; i < events[ename].length; i++){
					var el = events[ename][i];
					if (el.fun == callback && el.scope == scope) events[ename].splice(i, 1)
				};
				
			},
			
			/**
			* Tells that custom event is just happened.
			* Calls for all callback functions.
			* @param  {string} ename name of custom event.
			*/
			fire : function fire(ename){
				if (events[ename]){
					for (var i=0; i < events[ename].length; i++){
						var el = events[ename][i];
						el.fun.apply(el.scope, el.args);
					};
				}
			},
			
			/**
			* Logs all events.
			*/
			log : function log(){
				console.log(events);
			}
		}
	})();
	
	/**
	* Emulation of classical inheritance.
	* Used to extend class.
	* @param  {string} parentName name of function/class to be extended.
	*/	
	mvc.extend = function extend(){
		/**
		* Creates child function.
		*/
		return function (mixins){
			var Parent = this;
		
			var F = function() { }
			F.prototype = Parent.prototype;
			
			/**
			* Creating a new function.
			*/	
			var Child = function() { 
				/**
				* Execution of code inside the parent function.
				*/
				Parent.apply(this, arguments);
				/**
				* You can add code to be executed inside the new function 
				* and all its children to the method called "initialize".
				*/
				this.initialize.apply(this, arguments);
			}
			
			Child.prototype = new F();
			
			Child.prototype.constructor = Child;
			Child.superclass = Parent.prototype;
			Child.superclass.constructor = Parent;
			Child.extend = mvc.extend();
			Child.prototype.initialize = function(){};
			
			/**
			* Adding methods to prototype of new function.
			*/
			var mixins = Array.prototype.slice.call(arguments, 0);
			
			for (var i = 0; i < mixins.length; ++i)
			{
				for (var prop in mixins[i])
				{
					Child.prototype[prop] = mixins[i][prop];
				}
			}

			return Child;
		}
	} 
	
	/**
	* Shell for storages.
	* Unifies interaction with localStorage and chrome.storage.local.
	*/
	storage = undefined;
	
	if (window.localStorage) {
		storage = {
			set : function storage_set(a, b){
				localStorage.setItem(a, JSON.stringify(b));
			},
			remove : function storage_remove(a){
				localStorage.removeItem(a);
			},
			get : function storage_get(a, callback){
				console.log('localStorage.get:: ', a, localStorage[a], localStorage[a] == undefined ,'==');
				
				var data = (localStorage[a] != undefined) ? JSON.parse(localStorage[a]) : undefined;
				console.log('localStorage.get:: ', data);
				var arg = callback.arg || [];
				arg.unshift(data);
				if (callback.fun) callback.fun.apply(callback.scope || window, arg);
			}
		};
	}
	else if (chrome.storage) {
		storage = {
			set : function storage_set(a, b){
				//console.log('storage.set::', a, b);
				var data = {};
				data[a] = b;
				chrome.storage.local.set(data);
			},
			remove : function storage_remove(a){
				//console.log('storage.remove::   a=', a);
				chrome.storage.local.remove(a);
			},
			get : function storage_get(a, callback){
				chrome.storage.local.get(a, function(res){
					//console.log('storage.get:: data-callback:', res[a], callback);
					var arg = callback.arg || [];
					arg.unshift(res[a]);
					if (callback.fun) callback.fun.apply(callback.scope || window, arg);
				});
			}
		};
	}
	
	/**
	* Variable that counts how many models has been creating on the page.
	* Used for default names of created models.
	*/	
	var n = 0;
	
	
	mvc.Model = function Model(){
		this.name = 'm'+(n++);
		return this;
	};
	
	mvc.Model.prototype = {
	
		geturl : '',
		
		saveurl : '',
		
		data : undefined,
		
		getData : function mvc_Model_getData(){
			if (!this.geturl) return;
			var _this = this;
			
			$.ajax({
				url: this.geturl,
				method: 'GET',
				cache: false,
				success: function(resp){
					var recieved = JSON.parse(resp);
					storage.get(_this.name + 'data', {	
						fun: function(data, recieved){
							console.log('storage.get:: data, recieved', data, recieved);
							if (!data) {
								this.data = recieved.data;
								storage.set(this.name + 'data', this._savingFormat());
								this.save();
							}
							else {
								if (recieved.date >= data.date) {
									this.data = recieved.data;
									storage.set(this.name + 'data', this._savingFormat());
								} else {
									this.data = data.data;
									this.save();
								}
							}
							this.dataRecieved();
						},
						scope: _this,
						arg: [recieved]
					});
					
						
				},
				failure:  function(resp){
					storage.get(_this.name + 'data', {	
						fun: function(data){
							this.data = local.data;
							this.dataRecieved();
						},
						scope: _this,
						arg: [recieved]
					});
				}
			});
		},
		
		
		dataRecieved: function mvc_Model_dataRecieved(){
			mvc.fire(this.name + 'ModelUpdated');
		},
		
		
		dataFormat: function mvc_Model_dataFormat(){
			return this.data;
	 	},
		
		
		_savingFormat: function mvc_Model__savingFormat(){
			return  {
						'data': this.data, 
						'date': (new Date()).getTime()+''
					};
		},
		
		
		save : function mvc_Model_save(){
			storage.set(this.name + 'data', this._savingFormat());
			mvc.fire(this.name + 'ModelUpdated');
			
			var dataToSave = this.dataFormat();
			dataToSave.data = this._savingFormat();
			
			$.ajax({
				url: this.saveurl,
				data: dataToSave,
				type: 'POST'
			});
		},
		
		
		getItems : function mvc_Model_getItems(){
			return this.items;
		},
		
		
		addItem : function mvc_Model_addItem(item){
			this.data.push(item);
			this.save();
		},
		
		
		removeItem : function mvc_Model_removeItem(ind){
			this.data.splice(ind, 1);
			this.save();
		}
	};
	
	
	mvc.View = function View (model){
		this.model = model;
		this.name = this.model.name+'view';
		//mvc.subscribe('modelUpdated', this.render, this)
		return this;
	};
	
	
	mvc.View.prototype = {
		
		
		el: undefined,
		
		
		template: undefined,
		
		
		templateData: function mvc_View_templateData(){
			return {list: this.model.data}
		},
		
		
		render: function mvc_View_render(){
			$(this.el).html(_.template(this.template.html(), this.templateData()));
		}
	};
	
	
	mvc.Controller = function Controller(model, view){
		var _this = this;
		this.model = model;
		this.view = view;
		this.name = this.model.name+'controller';
		
		if (model) mvc.subscribe(this.model.name+'ModelUpdated', this.unbindHandlers, this);
		if (view) mvc.subscribe(this.model.name+'ModelUpdated', this.view.render, this.view);
		if (model) mvc.subscribe(this.model.name+'ModelUpdated', this.bindHandlers, this);
		
		
		this.model.getData();
		return this;
	};
	
	
	mvc.Controller.prototype = {
	
	
		handlers : [],
		
		
		bindedhandlers : [],
		
		
		bindHandlers : function mvc_Controller_bindHandlers(){
			for (var i=0; i < this.handlers.length; i++){
				this.bindHandler(this.handlers[i]);
			};
		},
		
		
		bindHandler : function mvc_Controller_bindHandler(ev){
			var _this = this;
			$(ev[0]).on(ev[1], '', function(e){(_this[ev[2]]).call(_this, e); e.preventDefault()});
			this.bindedhandlers.push([ev[0], ev[1], ev[2]]);
		},
		
		
		unbindHandlers : function mvc_Controller_unbindHandlers(){
			for (var i=0; i < this.bindedhandlers.length; i++){
				var ev = this.bindedhandlers[i];
				$(ev[0]).off();
			};
			this.bindedhandlers = [];
		},
		
		
		destroy: function mvc_Controller_destroy(){
			this.unbindHandlers();
			$(this.view.el).empty();
		}
	};
	
	mvc.Model.extend = mvc.extend();
	mvc.View.extend = mvc.extend();
	mvc.Controller.extend = mvc.extend();
	
	
	if (window.require) 
		window.define(['jquery'], function(){
			return mvc;
		})
	else window.mvc = mvc;

})(window);

