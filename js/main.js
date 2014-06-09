require.config({
	baseUrl: 'js',
	paths: {
		// the left side is the module ID,
		// the right side is the path to
		// the jQuery file, relative to baseUrl.
		// Also, the path should NOT include
		// the '.js' file extension. This example
		// is using jQuery 1.9.0 located at
		// js/lib/jquery-1.9.0.js, relative to
		// the HTML page.
		jquery: 'jquery-2.1.0.min',
		jqueryui: 'jquery-ui-1.10.4.custom.min',
		underscore: 'underscore-min',
		mvc: 'mvc',
		ModuleModel: 'module-model',
		todo: 'todo',
		annual:'annual'
	},
	shim: {
		"jqueryui": {
			deps: ['jquery']
		} 
	}
});

var config = {
	monthes : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
	dayNamesMin : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
	modules: ['annual', 'periodic', 'event'],
	toimport: ['jquery','jqueryui', 'underscore', 'mvc', 'ModuleModel', 'todo', 'annual', 'event', 'periodic']
};

	
require(
	config.toimport,
	function($, $ui, _, mvc, ModuleModel, todo, annual, event, periodic){
		for(var i in config.toimport){
		//	console.log(config.toimport[i], arguments[i], arguments[i] ? (arguments[i].prototype || '') : '');
		}
		
	$(function(){
	
		var MainModel = mvc.Model.extend({
			geturl : 'data.php',
			saveurl : 'save.php',
			onedaytime : 24*60*60*1000,
			initialize: function(){
				this.name = 'main';
			},
			initModel: function(name){
				mvc.subscribe(name + 'ModelChanged', this.updateData, this, [name]);
			},
			dataRecieved: function(){
				this.todoModel.setData(this.data.todo || []);
				
				var n = new Date();
				var date = this._dateToStr(n);
				var d = new Date(date);
				//console.log('dataRecieved:: ', date, this.data.today.date, (new Date(date)).getTime());
				
				var todayTime = (new Date(date)).getTime()*1;
				this.data.today.time = this.data.today.time*1;
				
				if (this.data.today.time !== todayTime){
					while (todayTime - this.data.today.time >= this.onedaytime) {
						this._handleTodayActs();
					}
					this.data.tomorrow.date = this._dateToStr(new Date(d.getTime()+this.onedaytime));
					this.data.tomorrow.acts = this._getDateActs(this.data.tomorrow.date);
					this.save();
				}
				else{
					mvc.fire(this.name + 'ModelUpdated');
				}
			},
			_dateToStr: function(d){
				return d.getMonth()+1+'/'+d.getDate()+'/'+d.getFullYear();
			},
			_handleTodayActs: function(){
				this.data.today.time += this.onedaytime;
				var date = this._dateToStr(new Date(this.data.today.time));
				console.log('_handleTodayActs:: ', date, this.data.today.time);
				this.data.today.date = date;
				
				this.data.today.acts = this.data.today.acts || [];
				var acts = this._getDateActs(date, 'deleteEvent');
				for (var i=0; i < acts.length; i++){
					acts[i].date = date;
					this.data.today.acts.push(acts[i]);
				};
				
				console.log('2_handleTodayActs:: ', date)
			},
			_getDateActs: function(date, today){
				var _time = (new Date(date)).getTime();
				var _date = date.split('/');
				_date[0] -= 1;
				_date[1] = parseInt(_date[1], 10);
				var acts = [];
				
				for (var i in this.data.periodic){
					var it = this.data.periodic[i];
					if (it.period && (_time-it.start)%it.period === 0) acts.push(it);
					if (it.unit === 'month' && _date[1]*1 == (new Date(it.start*1)).getDate()) acts.push(it);
				};
				
				if (this.data.annual[_date[0]] && this.data.annual[_date[0]][_date[1]]) {
					var data = this.data.annual[_date[0]][_date[1]];
					for (var i in data){
						acts.push(data[i]);
					}
				};
				if (this.data.event[_date[0]] && this.data.event[_date[0]][_date[1]]) {
					var data = this.data.event[_date[0]][_date[1]];
					for (var i in data){
						acts.push(data[i]);
					};
					if (today) delete this.data.event[_date[0]][_date[1]];
				}
				//console.log('acts: ', acts);
				return acts;
			},
			updateData: function(name){
				this.backup = JSON.stringify(this.data);
				console.log('updateData::  ', name, this);
				this.data[name] = this[name+'Model'].data;
				this.changed = name;
				this.save();
			},
			onSavingSuccess: function(resp){
				mvc.fire(this.changed + 'ModelUpdated');
				if (this.changed !== 'todo') mvc.fire(this.name + 'ModelUpdated');
			},
			removeTodayItem: function(ind){
				this.data.today.acts.splice(ind, 1);
				this.save();
			},
					});
		
		var MainView = mvc.View.extend({
			initialize: function(){
				//this.name = 'todoView';
				//mvc.subscribe('todoModelUpdated', this.render, this);
			},
			el : '#page',
			template: $('#main-template'),
			templateData: function(){
				return {list: this.model.data, config: config}
			},
			calendarHolder : '#calendar',
			
			scheduleHolder: '#schedule',
			scheduletemplate: '#schedule-template',
			renderSchedule: function MainView_renderSchedule(list, date){
				console.log(this.name, 'renderSchedule:: ', this.el);
				$(this.scheduleHolder).html(_.template($(this.scheduletemplate).html(), {list:list, _date: date}));
				
			}
		});
		
		
		var MainController = mvc.Controller.extend({
			handlers : [
				['a.show','click','periodPanelOpen'],
				['.close','click','periodPanelClose'],
				['#today .del','click','removeTodayItem']
			],
			initialize: function(){
				
				this.model['todoModel'] = new todo.model(this.model);
				mvc.subscribe(this.model.todoModel.name + 'ModelChanged', this.model.updateData, this.model, [this.model.todoModel.name]);
				this.todoView = new todo.view(this.model.todoModel);
				this.todoController = new todo.controller(this.model.todoModel, this.todoView);
			},
			bindHandlers : function main_Controller_bindHandlers(){
				this.constructor.superclass.bindHandlers.call(this);
				//console.log(this.todoView);
				this.todoView.render();
				this.todoController.bindHandlers();
				var _this = this;
				var an = this.model.data.annual || {};
				var ev = this.model.data.event || [];
				
				$(this.view.calendarHolder).datepicker({		
					firstDay: 1,		
					dayNamesMin: config.dayNamesMin,	
					monthNames: config.monthes,
					beforeShowDay: function(d1) {		
						var _title = '';			
						var _class = '';			
						if (an[d1.getMonth()] && an[d1.getMonth()][d1.getDate()] && an[d1.getMonth()][d1.getDate()].length){	
							_class = 'red';					
						}	
						if (ev[d1.getMonth()] && ev[d1.getMonth()][d1.getDate()] && ev[d1.getMonth()][d1.getDate()].length){	
							_class = 'red';					
						}
						return [true, _class, _title];	
					},
					onSelect: function(date){
						console.log('date', date, _this.model.data.tomorrow.date, _this.model.data.tomorrow);
						var list = _this.model._getDateActs(date);
						if (date[0] == 0) date = date.substr(1, date.length-1);
						_this.view.renderSchedule(list, date == _this.model.data.tomorrow.date ? 'tomorrow' : date);
					}
				});	
			},
			unbindHandlers : function main_Controller_unbindHandlers(){
				this.constructor.superclass.unbindHandlers.call(this);
				$(this.view.calendarHolder).datepicker( "destroy" );
				this.todoController.destroy();
			},
			annualModule: function(){
				this.model.annualModel = new annual.model(this.model);
				this.annualView = new annual.view(this.model.annualModel);
				this.annualController = new annual.controller(this.model.annualModel, this.annualView);
				
				this.model.annualModel.setData(this.model.data.annual || {});
			},
			periodicModule: function(){
				this.model.periodicModel = new periodic.model(this.model);
				this.periodicView = new periodic.view(this.model.periodicModel);
				this.periodicController = new periodic.controller(this.model.periodicModel, this.periodicView);
				this.model.periodicModel.setData(this.model.data.periodic || []);
				
			},
			eventModule: function(){
				this.model.eventModel = new event.model(this.model);
				this.eventView = new event.view(this.model.eventModel);
				this.eventController = new event.controller(this.model.eventModel, this.eventView);
				this.model.eventModel.setData(this.model.data.event || []);
				
			},
			destroy: function(name){
				this.model[name + 'Model'] = undefined;
				this[name + 'Controller'].destroy();
				this[name + 'View'] = undefined;
				this[name + 'Controller'] = undefined;
			},
			panel: $('#panel'),
			periodPanelOpen : function(e){
				this.moduleInited = $(e.target).attr('data-target');
				this[this.moduleInited+'Module']();
				this.model.initModel(this.moduleInited);
				this.panelShow();
				return false;
			},
			panelShow: function(){
				this.panel.show();
			},
			periodPanelClose : function(){
				this.destroy(this.moduleInited);
				this.moduleInited = undefined;
				this.panelHide();
				return false;
			},
			panelHide: function(){
				this.panel.hide();
			},
			removeTodayItem: function(e){
				this.model.removeTodayItem($(e.target).attr('data-ind'));
			}
		});
		
		var mainModel = new MainModel();
		var mainView = new MainView(mainModel);
		var mainController = new MainController(mainModel, mainView);
		
	console.log('mainModel: ', mainModel);
	console.log('mainController: ', mainController);
	});
});
	
	
	
	
	
	

