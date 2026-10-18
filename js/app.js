(function(){
var app=document.getElementById('app'),foot=document.getElementById('foot'),lb=document.getElementById('lb'),lbc=document.getElementById('lbc'),S,P;
var tones=['olive','avo','blue','yellow','brown','pink'],acc=['pink','blue','yellow','avo'];
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function slug(t){return String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function pid(p,i){return (i+1)+'-'+slug(p.title)}
function paras(t){return String(t||'').split(/\n\s*\n/).filter(Boolean).map(function(x){return '<p>'+esc(x)+'</p>'}).join('')}
function pad(n){return n<10?'0'+n:n}
function circ(n){return n<=20?String.fromCharCode(9311+n):n}
function src(p,j){var e=p.images&&p.images[j];e=e&&(e.image||e);return e?String(e).replace(/^\/+/,''):''}
function cap(p,j){var e=p.images&&p.images[j];return (e&&e.caption)||''}
function ph(p,i,j){var n=i+j,sh=['<path d="M90 420V230a110 110 0 0 1 220 0v190z"/>','<circle cx="200" cy="240" r="120"/>','<path d="M80 300c-20-90 60-170 150-150s110 120 60 200-190 60-210-50z"/>','<rect x="90" y="130" width="50" height="290"/><rect x="175" y="190" width="50" height="230"/><rect x="260" y="100" width="50" height="320"/>'][n%4];
return '<svg viewBox="0 0 400 500" role="img" aria-label="Placeholder for '+esc(p.title)+'" preserveAspectRatio="xMidYMid slice"><rect width="400" height="500" style="fill:var(--'+tones[n%6]+')"/><g style="fill:var(--'+acc[(n+1)%4]+')" transform="rotate('+(n*7-6)+' 200 250)">'+sh+'</g><circle cx="320" cy="90" r="22" style="fill:var(--soft)"/></svg>'}
function art(p,i,j){var s=src(p,j);return s?'<img src="'+esc(s)+'" alt="'+esc(p.title)+', image '+(j+1)+'" loading="lazy">':ph(p,i,j)}
function items(c){return P.map(function(p,i){return [p,i]}).filter(function(x){return !c||c==='All'||x[0].category===c})}
function lib(l){if(!l.length)return '<p>No projects in this category yet.</p>';return '<div class="lib">'+l.map(function(x){var p=x[0],i=x[1];return '<a class="spine" href="#/work/'+pid(p,i)+'" aria-label="'+esc(p.title)+'" style="height:'+(100-(i%3)*8)+'%;background:var(--'+tones[i%6]+')"><span class="cover">'+art(p,i,0)+'</span><span class="sp"><b>'+pad(i+1)+'</b> '+esc(p.title)+'</span></a>'}).join('')+'</div>'}
function star(cx,cy,a,b,n){var s='';for(var k=0;k<n*2;k++){var r=k%2?a:b,t=Math.PI*k/n;s+=(cx+r*Math.cos(t)).toFixed(0)+','+(cy+r*Math.sin(t)).toFixed(0)+' '}return s}
function hero(){var im=S.heroImage;return '<section class="hero2">'+(im?'<img src="'+esc(String(im).replace(/^\/+/,''))+'" alt="Portrait of Habibah">':'')+'<svg class="vec" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M0 40C140-20 250 80 210 190C185 260 90 240 0 320Z" fill="#141414"/><path d="M360 0C420 150 300 210 380 340S520 470 430 520" fill="none" stroke="#141414" stroke-width="3"/><polygon points="'+star(690,430,34,110,14)+'" fill="#efcfd1"/></svg><span class="tag" style="left:30%;top:20%">shape - 02</span><span class="tag" style="left:62%;top:46%">shape - 09</span><span class="tag" style="left:72%;top:60%">shape - 13</span><p class="cap c1">'+esc(S.tagline)+'</p><p class="cap c2">'+esc(S.intro||'')+'</p><h1>Habibah</h1></section>'}
var T=[[0,12,24,20,'b','','WHIMSICAL'],[24,12,50,28,'i','','SMOOTH-FLESH'],[74,12,26,16,'x',22,'PALE-GREEN'],[2,40,18,26,'y',60,'DARK-RIM'],[18,44,36,32,'i','','RICH-PIT'],[54,40,22,22,'x',70,'SOFT-BOWL'],[76,28,24,34,'y',50,'CREAM-YELLOW'],[0,66,20,18,'x',10,'WHITE-CERAMIC'],[54,62,26,14,'i','','BROWN-SPECKS'],[20,76,34,16,'y',80,'ORGANIC-SHAPES'],[80,62,20,20,'b','','MINIMALIST'],[40,86,30,12,'x',30,'SHARP-FOCUS'],[0,0,30,12,'b','','AVOCADO']];
function tile(t,k){var l=t[0],tp=t[1],w=t[2],h=t[3],m=t[4],s=t[5],px=w>=100?0:l/(100-w)*100,py=h>=100?0:tp/(100-h)*100,bg='';
if(m==='i')bg='background-size:'+10000/w+'% '+10000/h+'%;background-position:'+px+'% '+py+'%';
if(m==='x')bg='background-size:6000% '+10000/h+'%;background-position:'+s+'% '+py+'%';
if(m==='y')bg='background-size:'+10000/w+'% 6000%;background-position:'+px+'% '+s+'%';
return '<div class="t" style="left:'+l+'%;top:'+tp+'%;width:'+w+'%;height:'+h+'%;'+(bg?'background-image:url(images/avocado.jpg);'+bg:'')+'"><i>'+t[6]+'<br>'+(k+1)+'&darr;</i></div>'}
var views={
home:function(){return hero()+'<div class="sec"><h2>The library</h2><a href="#/work">Filter by category</a></div>'+lib(items())},
work:function(){return '<div class="sec"><h2>Work</h2></div><div class="filters" role="group" aria-label="Filter by category">'+['All'].concat(S.categories).map(function(c){return '<button type="button" aria-pressed="'+(c==='All')+'" data-c="'+esc(c)+'">'+esc(c)+'</button>'}).join('')+'</div><div id="g">'+lib(items())+'</div>'},
about:function(){return '<section class="about"><h1>About</h1><div class="txt">'+paras(S.about)+'</div></section>'},
contact:function(){var l=['<a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a>'].concat((S.links||[]).map(function(x){return '<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.label)+'</a>'}));return '<section class="links"><h1>Contact</h1>'+l.join('')+'</section>'}};
function project(id){var i=parseInt(id,10)-1,p=P[i];if(!p)return '<p class="txt">Project not found. <a href="#/work">Back to work</a></p>';
var n=Math.max((p.images||[]).length,4),sq='',cl='',d=String(p.description||'').split(/\n\s*\n/);
for(var j=0;j<n;j++){sq+='<figure class="sq" tabindex="0" role="button" aria-label="View image '+(j+1)+' larger"><span class="num">'+circ(j+1)+'</span><div class="art">'+art(p,i,j)+'</div></figure>';if(cap(p,j))cl+='<li><span>'+circ(j+1)+'</span>'+esc(cap(p,j))+'</li>'}
return '<div class="pj"><div class="sqs">'+sq+'</div><aside><a href="#/work">Back to work</a><h1>'+esc(p.title)+'</h1><hr><p class="it">'+esc(d[0])+'</p>'+(cl?'<ul class="cl">'+cl+'</ul>':'')+'<h3>Details</h3><p class="meta">'+esc(p.category)+(p.year?', '+esc(p.year):'')+'</p>'+paras(d.slice(1).join('\n\n'))+(p.role?'<h3>My role</h3><p>'+esc(p.role)+'</p>':'')+(p.process?'<h3>Process</h3>'+paras(p.process):'')+'</aside></div>'}
function route(){var h=location.hash.replace(/^#\/?/,'').split('/'),v=h[0]||'home';if(['home','work','about','contact'].indexOf(v)<0)v='home';
app.innerHTML=(v==='work'&&h[1])?project(h[1]):views[v]();document.title=(v==='home'?'':v[0].toUpperCase()+v.slice(1)+' | ')+'Habibah';window.scrollTo(0,0);
[].forEach.call(document.querySelectorAll('nav a'),function(a){a.toggleAttribute('aria-current',a.getAttribute('href')==='#/'+v)})}
function open(el){lbc.innerHTML=el.querySelector('.art').innerHTML;lb.showModal()}
document.addEventListener('click',function(e){var b=e.target.closest('button[data-c]'),a=e.target.closest('.sq');
if(b){[].forEach.call(b.parentNode.children,function(x){x.setAttribute('aria-pressed',x===b)});document.getElementById('g').innerHTML=lib(items(b.dataset.c))}
else if(a)open(a);else if(e.target.id==='lbx'||e.target===lb)lb.close()});
document.addEventListener('keydown',function(e){var a=e.target.closest&&e.target.closest('.sq');if(a&&e.key==='Enter')open(a)});
function load(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()})}
Promise.all([load('data/site.json'),load('data/projects.json')]).then(function(r){S=r[0];P=r[1].projects||[];
foot.innerHTML='<div class="mos"><h2>End of the archive</h2><div class="mosa" aria-hidden="true" style="--img:url(images/avocado.jpg)">'+T.map(tile).join('')+'</div></div><div class="bar"><div class="big">Habibah</div><a href="#/">Home</a><a href="#/work">Work</a><a href="#/about">About</a><a href="#/contact">Contact</a></div>';
window.addEventListener('hashchange',route);route()}).catch(function(){app.innerHTML='<p class="txt">The portfolio data could not load. If you opened this file directly, publish it or run a local server instead.</p>'});
})();
