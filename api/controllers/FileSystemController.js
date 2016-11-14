var fs = require('fs');
var fsExtra = require('fs-extra');
var path = require('path');
var uploadBase = process.cwd() + '/uploaded_files/projects';

var getRealFilepath = function(projectPath, filename){
	var dir = path.join(uploadBase, projectPath);
	if(filename){
		return path.join(dir, filename);
	}
	else{
		return dir;
	}
};

var FileSystemController = module.exports = {
	read : function(req, res){
		var projectPath = req.params.projectPath;
		var filename = req.params.filename || '';
		var filepath = getRealFilepath(projectPath, filename);

		// file or folder?
		var info = fs.statSync(filepath);
		if(info.isDirectory()){
			fs.readdir(filepath, (err, files) => {
				if(err){
					return res.json({ error : err });
				}
				for(var i=0; i<files.length; i++){
					var f = files[i];
					inf = fs.statSync(path.join(filepath, f));
				}
				return res.json(files);
			});
		}
		else if(info.isFile()){
			return res.sendfile(filepath);
		}
		else{
			return res.json({ error : 'Not a file or directory: ' + req.params.path });
		}
	},

	remove : function(req, res){
		var projectPath = req.params.projectPath;
		var filename = req.params.filename;
		var filepath = getRealFilepath(projectPath, filename);

		// file or folder?
		var info = fs.statSync(filepath);
		if(!info.isFile()){
			return res.json({ error : 'Not a file: ' + projectPath + '/' +
					screenId + '/' + areaId + '/' + filename });
		}
		return fs.unlink(filepath, (err) => {
			if(err){
				res.json({ error : err });
			}
			res.json({ removed : req.params });
		});
	},

	upload : function(req, res){
		var projectPath = req.params.projectPath;

		var destDir = getRealFilepath(projectPath);
		fsExtra.mkdirsSync(destDir);
		console.dir(req.file('file'));
		console.log('uploading to : ' + destDir);

		FileSystemController.handleUpload(req, {
			fileParamName : 'file',
			tempFilename : '.tmpFile',
			destDir : destDir,
			callback : function(fileInfo){
				console.log('handleUpload complete');
				return res.json(fileInfo);
			}
		});
	},

	handleUpload : function(req, cfg){
		var fs = require('fs');
		var util = require('util');
		var cb = cfg.callback;
		var fileParamName = cfg.fileParamName;
		var tempFilename = cfg.tempFilename;
		var destDir = cfg.destDir;

        req.file(fileParamName).upload({ saveAs : destDir + '/' + tempFilename },
				function (err, uploadedFiles){

			var file = uploadedFiles[0];
			var size = req.header('content-length');
			var fileType = file.type;
			var filename = file.filename;

			sails.log.debug(file);
	        var maxSize = cfg.maxSize || 1024 * 1024 * 100; // 100MB max for now
	        if(size > maxSize){
				resultFile.error
	        	return cb({ error : { code : 'upload_file_size', detail : 'max size=' + maxSize + ', actual size=' + size}});
	        }
	        fs.rename(file.fd, destDir + '/' + filename, (err) => {
				if(err){
					sails.log.error({ error : err });
					return cb(err);
				}
				var resultFile = {
					name : filename,
					size : size
				};
				var result = {
					files : [resultFile]
				};
				return cb(result);
			});
		});
	}
};
