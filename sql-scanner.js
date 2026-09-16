var fs=require('fs'),path=require('path');
var root=path.resolve(process.argv[2]||'.'),out=process.argv[3]||'sql-review.csv';
var ext={'.java':1,'.sql':1,'.xml':1,'.properties':1,'.yml':1,'.yaml':1};
var skip={'.git':1,target:1,build:1,node_modules:1},rules=[],rows=[],seen={};
function load(file,type){JSON.parse(fs.readFileSync(path.join(__dirname,'rule',file))).forEach(function(r){r.type=type;rules.push(r);});}
function line(s,n){return s.slice(0,n).split('\n').length;}
function quote(s){return '"'+String(s).replace(/"/g,'""')+'"';}
function add(file,text,sql,n,type){
  var key=file+line(text,n)+sql,r,i,review='';
  sql=sql.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');
  if(sql.length<12||!/^\s*(select|insert|update|delete|merge|with)\b/i.test(sql)||seen[key])return;
  seen[key]=1;
  for(i=0;i<rules.length;i++)if(rules[i].type!='config'&&new RegExp(rules[i].pattern,'i').test(sql))review+=(review?'; ':'')+rules[i].review;
  rows.push([file,line(text,n),'sql',sql,review]);
}
function scan(file,text){
  var m,p,n=0;
  if(path.extname(file)=='.sql'){
    p=text.split(';');p.forEach(function(s){add(file,text,s,n);n+=s.length+1;});
  }
  var re=/<(?:select|insert|update|delete|merge|sql)\b[^>]*>([\s\S]*?)<\//gi;
  while(m=re.exec(text))add(file,text,m[1],m.index);
  re=/("(?:\\.|[^"\\])*")(?:\s*\+\s*("(?:\\.|[^"\\])*"))+/g;
  while(m=re.exec(text))add(file,text,m[0].match(/"(?:\\.|[^"\\])*"/g).join('').replace(/"/g,''),m.index);
  re=/"(?:\\.|[^"\\])*"/g;
  while(m=re.exec(text))add(file,text,m[0].slice(1,-1),m.index);
  rules.filter(function(r){return r.type=='config';}).forEach(function(r){
    re=new RegExp(r.pattern,'ig');while(m=re.exec(text))rows.push([file,line(text,m.index),'config',m[0],r.review]);
  });
}
function walk(dir,base){
  fs.readdirSync(dir).forEach(function(name){
    var full=path.join(dir,name),rel=path.relative(base,full),s=fs.statSync(full);
    if(skip[name])return;
    if(s.isDirectory())walk(full,base);
    else if(ext[path.extname(name).toLowerCase()])scan(rel,fs.readFileSync(full,'utf8'));
  });
}
if(!process.argv[2]){console.log('node sql-scanner.js <source> [output.csv]');process.exit(2);}
load('db2-function.json','function');load('db2-syntax.json','syntax');load('db2-config.json','config');walk(root,root);
fs.writeFileSync(out,'file,line,type,match,review\n'+rows.map(function(r){return r.map(quote).join(',');}).join('\n')+'\n');
console.log('Created '+path.resolve(out)+' ('+rows.length+' findings)');
