define('FileManager', ['ProjectManager',
		'js/dependencies/jquery-ui/jquery-ui.min.js',
		'fileupload'],
		function(projectManager, fileupload){

	/* options : { fileUploadElement, fileBrowserElement, uploadProgressElement, projectId, screenId } */
	var options = false;
	var currentDir = '';

	return {
		add : function(opts){
			options = opts;
			var parent = opts.parent;
			var areaId = opts.areaId;
			var onFileChange = opts.onFileChange;
			var id = 'fileinput-' + areaId;
			var fileUploadElement = jQuery('<input type="file" id="' + id + '"/>');
			var uploadProgressElement = jQuery('<div class="file-upload-progress"></div>');
			var filenameElement = jQuery('<div class="uploaded-filename"><div>');
			opts.parent.append(fileUploadElement);
			opts.parent.append(uploadProgressElement);
			opts.parent.append(filenameElement);

			fileUploadElement.fileupload({
				url : '/file/upload/' + (opts.projectId || projectManager.getProject().path) +
						'/' + (opts.screenId || projectManager.getScreenId()) +
						'/' + areaId,
				dataType: 'json',
				paramName : 'file',
				 progressall : function(ev, data){
					 var progress = parseInt(data.loaded / data.total * 100, 10);
					 uploadProgressElement.text(progress + '% complete');
					 console.log(progress);
				 }
			});
			fileUploadElement.bind('fileuploaddrop', function (ev, data){
				if(typeof onFileChange == 'function'){
					onFileChange(ev, data);
				}
			});
    		fileUploadElement.bind('fileuploadchange', function (ev, data){
				if(typeof onFileChange == 'function'){
					onFileChange(ev, data);
				}
			});
			fileUploadElement.bind('fileuploaddone', function (ev, data) {
				var file = data.files[0];
				uploadProgressElement.text(file.name);
				console.log(file.name);
			});
		},

		browse : function(path, cb){
			currentDir = path;
			jQuery.ajax({
				url : '/file/get/' + (opts.projectId || projectManager.project.id) +
						'/' + (opts.screenId || projectManager.screenId) + '/' + path,
				type : 'GET'
			})
			.complete(function(resp){
				cb(resp.responseJSON);
			});
		},

		getFileAudioData : function(path, cb){
			var request = new XMLHttpRequest();
			request.open('GET', 'file/get/' + path, true);
			request.responseType = 'arraybuffer';
			request.onload = function() {
				cb(request.response);
			};
			request.send();
		}
	};
});
