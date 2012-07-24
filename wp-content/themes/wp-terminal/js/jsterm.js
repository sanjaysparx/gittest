/*
  jsterm.js: JavaScript Terminal
  Copyright (C) 2006 Natsuhiro Ichinose <ichinose@genome.ist.i.kyoto-u.ac.jp>
  License: GPL's
  $Id: jsterm.js,v 1.6 2006/07/13 07:59:53 ichinose Exp $
*/

var JSTerm={
  write:function(l){
    Terminal.stdout.write(l);
  },

  writeln:function(l){
    Terminal.stdout.puts(l);
  },

  puts:function(l){
    Terminal.stdout.puts(l);
  },

  require:function(url){
    var s=document.createElement("script");
    s.type="text/javascript";
    s.src=url;
    document.body.appendChild(s);
  },
  
  observe:function(element,type,callback,capture){
    if(element.addEventListener){
      element.addEventListener(type,callback,capture);
    }
    else if(element.attachEvent){
      element.attachEvent("on"+type,callback);
    }
    else{
      element["on"+type]=callback;
    }
  },

  RC:{
    get:function(){
      var c=document.cookie.split(";");
      var ans;
      var reg=/^[ ]*JSTERMRC=(.*)/;
      for(var i=0;i<c.length;i++){
	if(c[i].match(reg)){
	  ans=RegExp.$1;
	  break;
	}
      }
      return(unescape(ans));
    },
    set:function(text){
      var ctext="";
      var reg=/\\[ ]*$/;
      if(typeof text=="string"){
	ctext=text;
      }
      else if(text instanceof Array){
	ctext=text.join("\n");
      }
      document.cookie="JSTERMRC="+escape(ctext)+"; expires=Tue, 1-Jan-2037 00:00:00 GMT";
    },
    run:function(){
      var line="";
      var com=JSTerm.RC.get().split(/\n/);
      var reg=/\\[ ]*$/;
  
      for(var i=0;i<com.length;i++){
	if(com[i].match(reg)){
	  line+=com[i].replace(reg,"");
	}
	else{
	  line+=com[i];
	  try{
	    with(JSTerm){
	      eval(line);
	    }
	  }
	  catch(e){
	    JSTerm.puts("error in RC.run(): line "+(i+1)+": "+e.message);
	  }
	  line="";
	}
      }
    }
  },

  Editor:{
    value:"",
    win:null,
    area:null,
    open:function(value){
      if(JSTerm.Editor.win&&!JSTerm.Editor.win.closed){
	if(arguments.length>0){
	  JSTerm.Editor.value=value;
	  JSTerm.Editor.area.value=value;
	}
	return;
      }
      var win=window.open("","JSTermEditor","toolbar=0,scrollbars=0,location=0,status=0,menubar=0,resizable=0,width=500,height=600");
      var area=document.createElement("textarea");

      if(arguments.length>0){
	JSTerm.Editor.value=value;
      }

      win.document.open();
      win.document.write("<html><body><textarea style=\"width:100%;height:100%\" id=\"jstermeditor\">"+JSTerm.Editor.value+"</textarea></body></html>");
      win.document.close();

      win.document.title="JSTerm.Editor";


      area.value=JSTerm.Editor.value;
      area.style.width="100%";
      area.style.height="100%";

      JSTerm.Editor.area=Terminal.gid(win.document,"jstermeditor");
      JSTerm.Editor.win=win;

      JSTerm.observe(win,"unload",function(){JSTerm.Editor.get();},true);
    },
    close:function(){
      if(JSTerm.Editor.win&&!JSTerm.Editor.win.closed){
	JSTerm.Editor.win.close();
      }
    },
    get:function(){
      if(JSTerm.Editor.win&&!JSTerm.Editor.win.closed){
	JSTerm.Editor.value=JSTerm.Editor.area.value;
      }
      return(JSTerm.Editor.value);
    }
  }
};

Terminal.header="";

Terminal.initHook=function(){
  JSTerm.RC.run();
};

Terminal.commandCallBack=function(line){
  var text=null;

  if(line.match(/^[ ]*\</)){
    JSTerm.write(line);
  }
  else{
    try{
      with(JSTerm){
	text=eval(line);
      }
    }
    catch(e){
      try{
	JSTerm.puts("error: "+e.message);
      }
      catch(e2){
	JSTerm.puts("error: "+e);
      }
    }
  }
  if(text!=undefined){
    try{
      JSTerm.puts(""+text);
    }
    catch(e){
      try{
	JSTerm.puts("=>error: "+e.message);
      }
      catch(e2){
	JSTerm.puts("=>error: "+e);
      }
    }
  }
};
