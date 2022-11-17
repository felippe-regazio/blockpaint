let $selectedColor = '#000';
const $box = document.getElementById('box');

// ------------------------------------------------

function block(x, y) {
  const span = document.createElement('span');
  
  span.classList.add('block');
  span.setAttribute('data-y', y);
  span.setAttribute('data-x', x);

  span.onclick = () => {
    span.style.backgroundColor = $selectedColor;
  }

  span.onmouseover = e => {
    if (e.buttons == 1 || e.buttons == 3) {
      span.style.backgroundColor = $selectedColor;
    }
  }

  return span;
}

function row(size, y) {
  const div = document.createElement('div');
  
  div.setAttribute('data-y', y);
  div.classList.add('row');
  
  for(let i = 0; i < size; i++) {
    div.append(block(i, y));
  }

  return div;
}

function box(size, boxElement = $box) {
  boxElement.innerHTML = '';

  for(let i = 0; i < size; i++) {
    const $row = row(size, i);
    boxElement.append($row);
  }
}

function changeViewboxSize(size) {
  box(Number(size));
  $box.style.setProperty('--viewbox-size', size);
  $box.dataset.size = size;
}

function onSelectViewboxSize(e) {
  const size = e.target.value;
  const proceed = confirm("This will erase your current work");
  
  if (proceed) {
    changeViewboxSize(size);
  } else {
    e.target.value = $box.dataset.size;
  }
} 

function onPickColor(e) {
  $selectedColor = e.target.value;
  $box.style.setProperty('--selected-color', $selectedColor);
}

function toggleGrid(value) {
  $box.classList[value ? 'add' : 'remove']('grid');
}

function onToggleGrid(e) {
  toggleGrid(e.target.checked);
}

function getBoxData() {
  const data = { size: $box.dataset.size, box: [] };

  $box.querySelectorAll('.row').forEach(row => {
    const blocks = Array.from(row.querySelectorAll('.block')).map(item => {
      return [item.style.backgroundColor];
    });
    
    data.box.push(blocks);
  });

  return data;
}

function loadBoxData(loaded) {
  data = typeof loaded === 'string' ? JSON.parse(loaded) : loaded;
  changeViewboxSize(Number(data.size));
  box(data.size);
  document.querySelector('select[name=viewbox-size]').value = data.size;

  data.box.forEach((row, rowIndex) => {
    row.forEach((color, blockIndex) => {
      if (color) {
        const block = $box.querySelector(`.row[data-y="${rowIndex}"] .block[data-x="${blockIndex}"]`);
        block.style.backgroundColor = color;
      }
    });
  });
}

function save() {
  const data = getBoxData();
  const filename = prompt('File name');

  if (filename) {
    download(
      'data:text/plain;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(data)),
      `${filename || `blockpaint-${Date.now()}`}.json`
    );
  }
}

function download(content, filename) {
  const a = document.createElement('a');
  a.setAttribute('href', content);
  a.setAttribute('download', filename);
  a.click();
  a.remove();
}

function load(e) {
  const fr = new FileReader();

  fr.onload = () => {
    const loaded = fr.result;

    try {
      loadBoxData(loaded);
    } catch(error) {
      console.error(error);
      alert('Could not load the file');
    }
  }
    
  fr.readAsText(e.target.files[0]);
}

function share() {
  const link = `${window.location.href}?d=${JSON.stringify(getBoxData())}`;

  navigator.clipboard.writeText(link).then(
    function() {
      alert(`The share link was copied to your clipboard. Just paste the link to share this draw snippet with anyone.`);
    }, 
    
    function(error) {
      console.error(error);
      alert('Could not generate the share link');
    }
  );
} 

// ------------------------------------------------

const d = new URLSearchParams(window.location.search).get('d');

if (d) {
  loadBoxData(d);
  toggleGrid(false);
  
  document.querySelector('input[name=grid').checked = false;
  window.history.pushState(null, null, window.location.href);
  window.history.replaceState(null, null, window.location.pathname);
} else {
  box(24);
}