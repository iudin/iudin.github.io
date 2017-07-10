var timer;
var delay = 5000;
// view image
function viewImg(src, viewer) {
	return new Promise(function(resolve, reject) {
		var img = new Image();
		img.onload = function() {
			resolve();
		};
		img.onerror = function() {
			reject(Error('Ошибка загрузки изображения!'))
		};
		viewer.appendChild(img);
		img.src = src;
	});
}
function addText(content, placement) {
	var p = document.createElement('p');
	p.textContent = content;
	placement.appendChild(p);
}
function openViewer() {
	document.querySelector('.viewer').classList.add('active');
	document.querySelector('body').classList.add('lock');
}
function closeViewer() {
	document.querySelector('.viewer').classList.remove('active');
	document.querySelector('body').classList.remove('lock');
}
function addSpinner(v) {
	v.innerHTML = '<svg class="spinner" viewBox="0 0 30 30" width="30" height="30"><circle cx="15" cy="15" r="10" /></svg>';
}
function showImg() {
	document.querySelector('.viewer .spinner').style.display = 'none';
	document.querySelector('.viewer > figure > img').style.opacity = '1';
}
// img/thumbnails/title.jpg -> img/title.jpg
function getImgPath(src) {
	return src.replace(/thumbnails\//g, '');
}
// img/thumbnails/title.jpg -> title
function getImgTitle(src) {
	return src.replace(/(img\/|thumbnails\/|.jpg|.png|^\/)/g, '');
}
function titleToPath(s) {
	var title = s.replace(/\?/, '');
	return '/images/'+title+'.jpg';
}
// history functions
function historyPush(u) {
	var title, stateObj;
	if (u) {
		title = getImgTitle(u);
		stateObj = {src: title, caption: ""};
		title = '?'+title;
	} else {
		stateObj = null;
		title = location.href.replace(location.search, '');
	}
	window.history.pushState(stateObj, null, title);
}
// viewer nav functions
function isViewed(src) {
	var v = document.querySelector('.viewer > figure > img').getAttribute('src');
	return (src === v);
}
function neighborIndexes(arr) {
	var n = arr.findIndex(isViewed);
	var prev, next;
	prev = n-1;
	next = n+1;
	if (n == 0) {
		prev = arr.length-1;
	}
	if (n == arr.length-1) {
		next = 0;
	}
	return [prev, next];
}
function setNeighbors(arr) {
	var n = neighborIndexes(arr);
	document.querySelector('.controls > .prev').setAttribute('href', arr[n[0]]);
	document.querySelector('.controls > .next').setAttribute('href', arr[n[1]]);
}
function slideControl() {
	document.querySelector('.controls > a.slide').classList.toggle('play');
	document.querySelector('.controls > a.slide').classList.toggle('pause');
}
// I must use circuiting in order to transmit params to slide function
function slide(slider, arr) {
	return (function() {
		var next = document.querySelector('.controls > .next').getAttribute('href');
		historyPush(next);
		addSpinner(slider);
		viewImg(next, slider).then(function() {
			setNeighbors(arr);
		}).catch(function(err) {
			addText(err.message, slider);
		}).then(function() {
			showImg();
		});
	});
}
function play(slider, arr) {
	var ref = slide(slider, arr);
	timer = setInterval(ref, delay);
}
function stop() {
	clearInterval(timer);
	document.querySelector('.controls > a.slide').classList.add('play');
	document.querySelector('.controls > a.slide').classList.remove('pause');
}
// run
document.addEventListener('DOMContentLoaded', function() {
	const viewerFig = document.querySelector('.viewer > figure'); // location of image in viewer
	const imgNodes = document.querySelectorAll('.gallery img'); // thumbnails
	const srcArray = Array.from(imgNodes).map(function(obj) {
		return getImgPath(obj.getAttribute('src'));
	}); // array of big images
	// show image by direct link
	if (location.search && /^\?20\d{2}_\d{3}$/.test(location.search)) {
		var imgSrc = titleToPath(location.search);
		openViewer();
		addSpinner(viewerFig);
		viewImg(imgSrc, viewerFig).then(function() {
			setNeighbors(srcArray);
		}).catch(function(err) {
			addText(err.message, viewerFig);
		}).then(function() {
			showImg();
		});
	}
	// click thumbnails
	[].forEach.call(imgNodes, function(el) {
		el.addEventListener('click', function() {
			var imgSrc = getImgPath(el.getAttribute('src'));
			historyPush(el.getAttribute('src'));
			openViewer();
			addSpinner(viewerFig);
			viewImg(imgSrc, viewerFig).then(function() {
				setNeighbors(srcArray);
			}).catch(function(err) {
				addText(err.message, viewerFig);
			}).then(function() {
				showImg();
			});
		});
	});
	// close viewer
	document.querySelector('.viewer .viewer-close').addEventListener('click', function() {
		viewerFig.innerHTML = '';
		stop();
		historyPush('');
		closeViewer();
	});
	// nav in viewer
	[].forEach.call(document.querySelectorAll('.viewer-nav a:not(.slide)'), function(el) {
		el.addEventListener('click', function(e) {
			e.preventDefault();
			stop();
			historyPush(el.getAttribute('href'));
			addSpinner(viewerFig);
			viewImg(el.getAttribute('href'), viewerFig).then(function() {
				setNeighbors(srcArray);
			}).catch(function(err) {
				addText(err.message, viewerFig);
			}).then(function() {
				showImg();
			});
		});
	});
	// slideshow control
	document.querySelector('.controls > a.slide').addEventListener('click', function(e) {
		e.preventDefault();
		slideControl();
		if (this.classList.contains('pause')) {
			play(viewerFig, srcArray);
		} else {
			clearInterval(timer);
		}
	});
	// popstate event - click on browser back or forward btn, viewer can be opened or closed
	window.addEventListener('popstate', function() {
		stop();
		if (location.search) {
			var imgSrc = titleToPath(window.history.state.src);
			openViewer();
			addSpinner(viewerFig);
			viewImg(imgSrc, viewerFig).then(function() {
				setNeighbors(srcArray);
			}).catch(function(err) {
				addText(err.message, viewerFig);
			}).then(function() {
				showImg();
			});
		} else {
			closeViewer();
		}
	})
});