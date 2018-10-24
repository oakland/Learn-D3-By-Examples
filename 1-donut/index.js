const data = [
  {
    "name": "allCoder",
    "count": 100
  },
  {
    "name": "fe",
    "count": 15
  }
];

const minAng = 10 / 360;
const outerRadius = 100;
const innerRadius = 80;
const delta = 5;
const delay = 150;
const colorRange = ['#a53c3c', '#2c364e'];
const textRange = ['前端开发', '所有程序员'];

const donut = document.querySelector('.svgWrapper'); // 如果是 react，可以通过 ref 的方式获取 dom

const arcGen = d3
  .arc()
  .outerRadius(d => {
    return d.index === 0
      ? outerRadius + delta
      : outerRadius;
  })
  .innerRadius(innerRadius);
const pieLayout = d3
  .pie()
  .sort(null)
  .startAngle(0)
  .endAngle(2 * Math.PI)
  .value(d => d.count);
const colorScale = d3
  .scaleOrdinal()
  .domain([0, 1])
  .range(colorRange);
const textScale = d3
  .scaleOrdinal()
  .domain([0, 1])
  .range(textRange);
const lineData = [{ x: -70, y: 0 }, { x: 70, y: 0 }];
const lineGen = d3
  .line()
  .x(d => d.x)
  .y(d => d.y);

function formatData(data) {
  // add real count and translate name
  data.forEach((item, index, array) => {
    const len = array.length;
    item.realCount = item.count;
    item.translateName = textScale(len - 1 - index);
  });
  // min angle
  const fe = data[1].count;
  const allCoder = data[0].count;
  if (fe / allCoder < minAng && fe !== 0) {
    data[1].count = allCoder * minAng;
  }
  // data for arc
  data[0].count = allCoder - fe;
  data.reverse();
  return data;
}

function renderDonut() {
    // init svg
    const pie = formatData(data);
    const tooltip = d3.select('.tooltip');
    const svg = d3
      .select(donut)
      .attr('width', (outerRadius + delta) * 2)
      .attr('height', (outerRadius + delta) * 2)
      .append('g')
      .attr(
        'transform',
        `translate(${outerRadius + delta}, ${outerRadius + delta})`
      );

    const g = svg
      .selectAll('.arc')
      .data(pieLayout(pie))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // render arc
    g.append('path')
      .classed('area', true)
      .style('fill', (d, i) => colorScale(i))
      .transition()
      .ease(d3.easeLinear)
      .delay((d, i) => i * delay)
      .duration(delay)
      .attrTween('d', d => {
        const i = d3.interpolate(d.startAngle, d.endAngle);
        return t => {
          d.endAngle = i(t);
          return arcGen(d);
        };
      });

    // add middle line
    g.append('path')
      .classed('middle', true)
      .attr('d', lineGen(lineData));
    // add names
    const fontSize = '16px';
    g.append('text')
      .attr('fill', d => colorScale(d.data.name))
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('y', d => {
          return d.index === 0 ? -12 : 12 + parseInt(fontSize, 10);
      })
      .text(d => textScale([d.index]));
    // add numbers
    g.append('text')
      .attr('fill', d => colorScale(d.data.name))
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('y', d => {
          return d.index === 0 ? -40 : 40 + parseInt(fontSize, 10);
      })
      .text((d, i) => pie[i].realCount);

    // show tooltip
    d3.selectAll('.area')
      .on('mousemove', function(d) {
        const className = d.index === 0 ? 'pointBrown' : 'pointBlack';
        const html = `<span class=${className}></span> ${d.data.translateName} ${d.data.realCount}`;
        tooltip
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 25 + 'px')
          .style('display', 'inline-block')
          .html(html);
      })
      .on('mouseout', function(d) {
          tooltip.style('display', 'none');
      });
}

renderDonut();