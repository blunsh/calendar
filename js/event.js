define('event',
	['jquery','jqueryui', 'underscore', 'mvc', 'ModuleModel'],
	function($,$ui, _, mvc, ModuleModel){
	
		//console.log('event--mvc', ModuleModel,mvc);
		var EventModel = ModuleModel.extend({
			initialize: function(){
				this.main = arguments[0];
				this.name = 'event';
			},
			addItem : function(item){
				this.backup = JSON.stringify(this.data);
				this.data[item.month] = this.data[item.month] || {};			
				this.data[item.month][item.day] = this.data[item.month][item.day] || [];			
				this.data[item.month][item.day].push({
					name: item.name,
					date: item.date,
					created: item.created
				});
				this.save();
			},
			removeItem : function(ind){
				this.backup = JSON.stringify(this.data);
				var i = ind.split('-');
				this.data[i[0]][i[1]].splice(i[2],1);
				console.log(this.data[i[0]][i[1]]);
				this.save();
			}
		});
		
		var EventView = mvc.View.extend({
			initialize: function(){
				//this.name = 'todoView';
				//mvc.subscribe('todoModelUpdated', this.render, this);
			},
			el : '#event',
			template : $('#event-template'),
			templateData: function(){
				return {list: this.model.data, monthes: config.monthes}
			}
		});
		
		var EventController = mvc.Controller.extend({
			handlers : [
				['#event .del','click','removeItem'],
				['#add-event','click','addItem']
			],
			initialize: function(){
				//this.name = 'todoController';
				console.log('AnnualController: ',this);
				//mvc.subscribe('todoViewRendered', this.bindHandlers, this);
			},
			bindHandlers : function mvc_Controller_bindHandlers(){
				this.constructor.superclass.bindHandlers.call(this);
				$('#event-date').datepicker({		
					firstDay: 1,		
					dayNamesMin: config.dayNamesMin,	
					monthNames: config.monthes
				});	
			},
			removeItem : function(e){
				this.model.removeItem($(e.target).attr('data-ind'));
			},
			addItem : function(){
				if (!$('#event-name').val() || !$('#event-date').val() ) return;
				this.model.addItem({
					"name": $('#event-name').val(),
					"date": $('#event-date').val(),
					"day": parseInt($('#event-date').val().split('/')[1], 10)+'',
					"month": parseInt($('#event-date').val().split('/')[0], 10)-1+'',
					"created": (new Date()).getTime()
				});
			}
		});


		return {
			model: EventModel,
			view: EventView,
			controller: EventController
		}
});