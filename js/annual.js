define('annual',
	['jquery', 'underscore', 'mvc', 'ModuleModel'],
	function($, _, mvc, ModuleModel){	
		//console.log('annual---mvc', ModuleModel, mvc);
		
		var AnnualModel = ModuleModel.extend({
			initialize: function(){
				this.main = arguments[0];
				this.name = 'annual';
			},
			addItem : function(item){
				this.backup = JSON.stringify(this.data);
				this.data[item.month] = this.data[item.month] || {};
				this.data[item.month][item.day] = this.data[item.month][item.day] || [];
				this.data[item.month][item.day].push({
					name: item.name + (item.year ? ' ('+item.year+')' : ''),
					date: item.month + '/'+ item.day + (item.year ? '/'+item.year : '')
				});
				this.data[item.month][item.day].sort();
				this.save();
			},
			removeItem : function(ind){
				this.backup = JSON.stringify(this.data);
				var i = ind.split('-');
				this.data[i[0]][i[1]].splice(i[2],1);
				this.save();
			}
		});
		
		var AnnualView = mvc.View.extend({
			initialize: function(){
				//this.name = 'todoView';
				//mvc.subscribe('todoModelUpdated', this.render, this);
			},
			el : '#annual',
			template : $('#annual-template'),
			templateData: function(){
				return {list: this.model.data, monthes: config.monthes}
			}
		});
		
		var AnnualController = mvc.Controller.extend({
			handlers : [
				['#annual .del','click','removeItem'],
				['#add-annual','click','addItem']
			],
			initialize: function(){
				//this.name = 'todoController';
				console.log('AnnualController: ',this);
				//mvc.subscribe('todoViewRendered', this.bindHandlers, this);
			},
			bindHandlers : function mvc_Controller_bindHandlers(){
				this.constructor.superclass.bindHandlers.call(this);
				$('#annual-date').datepicker({		
					firstDay: 1,		
					dayNamesMin: config.dayNamesMin,	
					monthNames: config.monthes
				});	
			},
			removeItem : function(e){
				//console.log(this);
				console.log(e);
				this.model.removeItem($(e.target).attr('data-ind'));
			},
			addItem : function(){
				//console.log(this);
				if (!$('#annual-name').val() || !$('#annual-date').val() ) return;
				var date = $('#annual-date').val().split('/');
				this.model.addItem({
					"name": $('#annual-name').val(),
					"day": date[1],
					"month": date[0]*1-1,
					"year": $('#annual-year').val(),
					"date": $('#annual-date').val()
				});
			}
		});

		return {
			model: AnnualModel,
			view: AnnualView,
			controller: AnnualController
		}
});