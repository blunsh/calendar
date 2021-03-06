﻿define('todo',
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
			//template : $('#todo-template'),
			template : function(list){
				var str = '\
				<div class="title inner">todo</div> \
				<ul> ';
					_.each(list, function(item, ind){ 
						str += ' \
						<li> \
							<span class="quadr"> \
								<a href="#" class="del" data-ind="' + ind + '">del</a> \
							</span>' +
							item.act +
						'</li>';
					
					});
				str += ' \
				</ul> \
				<div class="button-holder"> \
					<input type="text" id="todo-name" /> \
					<div><a id="add-todo" href="#">add</a></div> \
				</div>';
				return str;
			},
			render : function(){
				console.log(this.name, 'render::', this.model.data, this.el);
				//var template = _.template(this.template.html(), {list: this.model.data});
				var template = this.template(this.model.data);
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
