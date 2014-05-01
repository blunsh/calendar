define('periodic',
	['jquery', 'underscore', 'mvc', 'ModuleModel'],
	function($, _, mvc, ModuleModel){
		
		var PeriodicModel = ModuleModel.extend({
			initialize: function(){
				this.main = arguments[0];
				this.name = 'periodic';
			},
			addItem: function(item){
				var d = new Date(item.start);
				
				this.backup = JSON.stringify(this.data);
				
				var period = 
					item.unit == 'week' ? item.number*7*24*60*60*1000 : 
					item.unit == 'day' ? item.number*24*60*60*1000 : 0;
				
				this.data.push({
					"name": item.name,
					"number": item.number,
					"unit": item.unit,
					"start": d.getTime(),
					"period": period,
					"created": (new Date()).getTime()
				});
				this.save();
			}
		});
		
		var PeriodicView = mvc.View.extend({
			el : '#periodic',
			template : $('#periodic-template')
		});
		
		var PeriodicController = mvc.Controller.extend({
			handlers : [
				['#periodic .del','click','removeItem'],
				['#add-periodic','click','addItem']
			],
			initialize: function(){
				//this.name = 'todoController';
				console.log('periodicController: ',this);
				//mvc.subscribe('todoViewRendered', this.bindHandlers, this);
			},
			bindHandlers : function mvc_Controller_bindHandlers(){
				this.constructor.superclass.bindHandlers.call(this);
				$('#periodic-date').datepicker({		
					firstDay: 1,		
					dayNamesMin: config.dayNamesMin,	
					monthNames: config.monthes
				});	
			},
			removeItem : function(e){
				this.model.removeItem($(e.target).attr('data-ind'));
			},
			addItem : function(){
				if (!$('#periodic-name').val() || !$('#periodic-number').val() ) return;
				this.model.addItem({
					"name": $('#periodic-name').val(),
					"number": $('#periodic-number').val(),
					"unit": $('#periodic-unit').val(),
					"start": $('#periodic-date').val(),
					"created": (new Date()).getTime()
				});
			}
		});

		return {
			model: PeriodicModel,
			view: PeriodicView,
			controller: PeriodicController
		}
});