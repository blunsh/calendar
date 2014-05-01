define(function(){
	
	var mvc = (function (){
		var mvc={};
		return {
			subscribe : function(ename, callback, scope, args){
				scope = scope || window;
				if (!mvc[ename]) mvc[ename] = [];
				mvc[ename].push({
					fun: callback,
					scope: scope,
					name: ename,
					args: args
				})
			},
			
			unsubscribe : function(ename, callback, scope){
				if (!mvc[ename]) return;
				for (var i=0; i < mvc[ename].length; i++){
					var el = mvc[ename][i];
					if (el.fun == callback && el.scope == scope) mvc[ename].splice(i, 1)
				};
				
			},
			
			fire : function(ename){
				console.log('fire!!!  ', ename);
				if (mvc[ename]){
					for (var i=0; i < mvc[ename].length; i++){
						var el = mvc[ename][i];
						el.fun.apply(el.scope, el.args);
					};
				}
			},
			log : function(){
				console.log(mvc);
			}
		}
	})();
	
	
	/*
	var mediator   (function(){ 
    var subscribe   function(channel, fn){ 
        if (!mediator.channels[channel]) mediator.channels[channel]    []; 
        mediator.channels[channel].push({ context: this, callback: fn }); 
        return this; 
    }, 
  
    publish   function(channel){ 
        if (!mediator.channels[channel]) return false; 
        var args   Array .prototype .slice .call(arguments, 1); 
        for (var i   0, l   mediator.channels[channel].length; i < l; i++) { 
            var subscription   mediator.channels[channel][i]; 
            subscription.callback.apply(subscription.context, args); 
        } 
        return this; 
    }; 
  
    return { 
        channels: {}, 
        publish: publish, 
        subscribe : subscribe, 
        installTo : function(obj){ 
            obj .subscribe   subscribe; 
            obj .publish   publish; 
        } 
    }; 

}()); 

И два примера использования реализации, написанной выше: 

//Pub/sub on a centralized mediator 

mediator.name   "tim"; 
mediator.subscribe('nameChange ', function(arg){ 
    console .log(this.name); 
    this.name   arg; 
	console .log(this.name); 
}); 

mediator.publish('nameChange ',  'david '); //tim, david 

//Pub/sub via third party mediator 

var obj   { name :  'sam ' }; 
mediator.installTo(obj); 
obj .subscribe('nameChange ', function(arg){ 
    console .log(this.name); 
    this.name   arg; 
    console .log(this.name); 
}); 

obj .publish('nameChange ',  'john'); //sam, john 
	*/
	
	
	/* - example
	var MyModel = mvc.model.extend({
		name: 'MyModel', 
		gettitle:function Mod_gettitle(){
			console.log('parentMethod')
		}
	});
	var MyModelObj = new MyModel();

	
	var MyModelChild = MyModel.extend({
		name: 'MyModelChild', 
		gettitle:function M1_gettitle(){
			this.constructor.superclass.gettitle.call(this);
			console.log('myMethod');
		}
	});
	var MyModelChildObj = new MyModelChild();
	
	MyModelChildObj.gettitle();
	*/
	
	var n = 0;
	
	mvc.extend = function extend(t){
		return function(obj){
			var Parent = this;
		
			var F = function() { }
			F.prototype = Parent.prototype;
			
			var Child = function() { 
				Parent.apply(this, arguments);
				//console.log('extend  ', t);
				this.initialize.apply(this, arguments);
				//console.log('extend  ', t, this.name);
			}
			Child.prototype = new F();
			
			Child.prototype.constructor = Child;
			Child.superclass = Parent.prototype;
			Child.superclass.constructor = Parent;
			Child.extend = mvc.extend(t);
			Child.prototype.initialize = function(){};
			
			var mixins = Array.prototype.slice.call(arguments, 0);
			//console.log(t, 'mixins    ', mixins);
			for (var i = 0; i < mixins.length; ++i)
			{
				for (var prop in mixins[i])
				{
			//		console.log('mixin    ', prop,  mixins[i][prop]);
					Child.prototype[prop] = mixins[i][prop];
				}
			}
			//console.log(t, 'Child    ', Child.prototype);
			return Child;
		}
	}
	
	mvc.Model = function Model(arg){
		//console.log('arg', arg);
		this.name = 'm'+(n++);
		
		return this;
	};
	mvc.Model.prototype = {
		geturl : '',
		saveurl : '',
		data : undefined,
		backup : '',
		getData : function(){
			if (!this.geturl) return;
			var _this = this;
			$.ajax({
				url: this.geturl,
				method: 'GET',
				cache: false,
				success: function(resp){
					_this.data = JSON.parse(resp);
					_this.backup = resp;		
					_this.dataRecieved();
				}
			});
		},
		dataRecieved: function(){
			mvc.fire(this.name + 'ModelUpdated');
		},
		dataFormat: function(){
			return {"data":this.data};
		},
		save : function(){
			//var _this = this;
			var data = this.dataFormat(); 
			$.ajax({
				url: this.saveurl,
				data: data,
				type: 'POST',
				success: this.onSavingSuccess.bind(this),
				failure: this.onSavingFailure.bind(this)
			});
		},
		onSavingSuccess: function(resp){
				mvc.fire(this.name + 'ModelUpdated');
		},
		onSavingFailure: function(resp){
			//console.log(this);
			_this.data = JSON.parse(_this.backup);
			mvc.fire('savingerror');
		},
		getItems : function(){
			return this.items;
		},
		addItem : function(item){
			this.backup = JSON.stringify(this.data);
			this.data.push(item);
			this.save();
		},
		removeItem : function(ind){
			this.backup = JSON.stringify(this.data);
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
		templateData: function(){
			return {list: this.model.data}
		},
		render: function mvc_View_render(){
			console.log(this.name, 'render:: ', this.el);
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
			//console.log(ev, $(ev[0]));
			var _this = this;
			$(ev[0]).on(ev[1], '', function(e){(_this[ev[2]]).call(_this, e); e.preventDefault()});
			this.bindedhandlers.push(ev);
		},
		unbindHandlers : function mvc_Controller_unbindHandlers(){
			for (var i=0; i < this.bindedhandlers.length; i++){
				var ev = this.bindedhandlers[i];
				//console.log(ev);
				$(ev[0]).off();
			};
			this.bindedhandlers = [];
		},
		destroy: function(){
			this.unbindHandlers();
			$(this.view.el).empty();
		}
	};
	
	mvc.Model.extend = mvc.extend('Model');
	mvc.View.extend = mvc.extend('View');
	mvc.Controller.extend = mvc.extend('Controller');
	
	return  mvc;
});
