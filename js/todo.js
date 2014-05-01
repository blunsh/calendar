define('todo',
	['jquery', 'underscore', 'mvc', 'ModuleModel'],
	function(jquery, underscore, mvc, ModuleModel){
		
		//console.log('todo--mvc', mvc, ModuleModel);
		var TodoModel = ModuleModel.extend({
			initialize: function(){
				this.main = arguments[0];
				this.name = 'todo';
				
			}
		});
		
		var TodoView = mvc.View.extend({
			initialize: function(){
				//this.name = 'todoView';
				//mvc.subscribe('todoModelUpdated', this.render, this);
			},
			el : '#todo',
			template : $('#todo-template'),
			render1 : function(){
				console.log(this.name, 'render::', this.model.data, this.el);
				var template = _.template(this.template.html(), {list: this.model.data});
				$(this.el).html(template);
				//mvc.unsubscribe('modelUpdated', this.render, this);
				mvc.fire('todoViewRendered');
			}
		});
		
		var TodoController = mvc.Controller.extend({
			handlers : [
				['#todo .del','click','removeItem'],
				['#add-todo','click','addItem']
			],
			initialize: function(){},
			removeItem : function(e){
				$(e.target).addClass('active');
				this.model.removeItem($(e.target).attr('data-ind'));
			},
			addItem : function(){
				if (!$('#todo-name').val()) return;
				this.model.addItem({
					"act": $('#todo-name').val(),
					"created": (new Date()).getTime()
				});
			}
		});


		return {
			model: TodoModel,
			view: TodoView,
			controller: TodoController
		}
});	
