define('OoshJsonEditor', ['../../js/dependencies/jsoneditor/jsoneditor.min', 'ProjectManager'],
        function(JSONEditor, projectManager){
    var editor = false;
    var isDirty = false;

    jQuery(document).ready(function(){
        var container = jQuery('.json-editor').get(0);
        var options = {
            onChange : function(){
                var mgr = Oosh.projectManager;
                var proj = mgr.getProject();
                if(proj){
                    mgr.jsonEditor.setDirty(true);
                }
            }
        };
        editor = new JSONEditor(container, options);
    });

    return {
        isDirty : function(){
            return isDirty;
        },

        setDirty : function(dirty){
            isDirty = dirty;
        },

        setContent : function(content){
            editor.set(content);
        },

        getContent : function(){
            return editor.get();
        },

        requiresSave : function(){
            return isDirty;
        },

        save : function(){
            if(isDirty){
                var prj = editor.get();
                console.log('OoshJsonEditor wants to save data:');
                console.dir(prj);
                var mgr = Oosh.projectManager;
				mgr.update(prj);
				mgr.jsonEditor.setDirty(false);
            }
            else{
                console.error('JSONEditor save not required');
            }
        }
    };
});
