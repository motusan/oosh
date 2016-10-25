define('ModalManager', ['jquery', 'OoshJsonEditor', 'Preferences', 'ProjectManager', 'AreaManager'],
    function(jquery, jsonEditor, preferences, projectManager, areaManager){

    var modalMap = {
        'project-list': function(){
            projectManager.getProjectList(function(list){
                var projectList = jQuery('.project-list');
                projectList.empty();
                list.forEach(function(project){
                    var item = jQuery('<tr class="project"><td><a href="#">' + project.name + '</a></td></tr>');
                    var a = item.find('a');
                    a.data('project', project);
                    projectList.append(item);
                    a.on('click', function(){
                        var proj = a.data('project');
                        Oosh.openProject(proj.path, function(project){
                            if(project.error){
                                console.error(project.error);
                                return false;
                            }
                            Oosh.dismissModal('project-list');
                        });
                    });
                });
            });
        },
        'new-project': function(){

        },
        'screen-info': function(){
            var screenId = preferences.get('screenId');
            if(!screenId){
                screenId = prompt('Enter an identifier for your screen. It must be unique within the project');
                if(screenId){
                    preferences.add({ screenId : screenId });
                    jQuery('.screen-info-dialog #screenid').val(screenId);
                }
                else{
                    alert('No screen ID, no project!');
                    return false;
                }
            }
            else{
                jQuery('.screen-info-dialog #screenid').val(screenId);
            }
        },
        'new-area': function(){
            areaManager.createScreenArea(projectManager.getLocalScreen());
        },
        'add-widget': function(){
            var dlg = jQuery('.add-widget-dialog');
            var widgetList = dlg.find('.widget-list');
            widgetList.empty();
            var confs = Oosh.getWidgetConfigurations();
            confs.forEach(function(conf){
                var item = jQuery('<tr class="widget-row">' +
						'<td><a href="#" title="' + conf.description + '">' + conf.id + '</a></td></tr>');
                var a = item.find('a');

                a.data('widget', conf);
                widgetList.append(item);
                a.draggable({
                    helper : 'clone',
                    appendTo : 'body',
                    zIndex : 1101,
                    start : function(ev, ui){
						var area = jQuery('.area');
						dlg.find('.modal-dialog').draggable('disable');
                        area.css('z-index', 1100);
                    },
					stop : function(ev, ui){
						var area = jQuery('.area');
						dlg.find('.modal-dialog').draggable('enable');
                        area.css('z-index', 0);
					}
                });

            });
        },
        'json-editor': function(data){
            jQuery('.json-editor-dialog .btn-save').on('click', function(){
                jsonEditor.save();
            });

            if(!data){
                data = projectManager.getProject();
            }
            jsonEditor.setContent(data);
        },
    };

    var onModalDisplay = function(dlgName, data){
        var onDlgFn = modalMap[dlgName];
        if(typeof onDlgFn != 'function'){
            return false;
        }
        onDlgFn(data);
    };

    var publicMethods = {
        showModal : function(dlgName, data){
            var dlg = jQuery('.' + dlgName + '-dialog');
            dlg.modal({
                backdrop : 'static',
				keyboard : true
            });
            dlg.on('hidden.bs.modal', function(){
                dlg.find('.btn-save').off('click');
                dlg.find('.btn-close').off('click');
            });
            onModalDisplay(dlgName, data);
        },

        show : function(dlgName, data){
			publicMethods.showModal(dlgName, data);
            var dlg = jQuery('.' + dlgName + '-dialog');
            dlg.find('.modal-dialog').draggable();
            dlg.find('.modal-content').resizable();
            //jQuery('.modal-backdrop').remove();
        },

        dismissModal : function(dlgName){
            var dlg = jQuery('.' + dlgName + '-dialog');
            dlg.modal('hide');
        },

		onDismiss : function(cb){
            var dlg = jQuery('.' + dlgName + '-dialog');
            dlg.on('hidden.bs.modal', cb);
		}
    };
    return publicMethods;
});
