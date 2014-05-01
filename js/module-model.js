define('ModuleModel',
	['mvc'],
	function(mvc){
		//console.log('module--mvc',mvc);
		var ModuleModel = mvc.Model.extend({
			setData: function(data){
				this.data = data;
				console.log('setData:: ', this.name, '.data   ', this.data);
				this.dataRecieved();
			},
			save: function(){
				mvc.fire(this.name + 'ModelChanged');
			}
		});
		
		return ModuleModel;
});
	
	