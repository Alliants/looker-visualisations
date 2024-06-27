looker.plugins.visualizations.add({
  id: "circle_packing",
  label: "Circle Packing",
  options: {
    color: {
      type: "string",
      label: "Base Color",
      default: "#1f77b4",
    },
    label_size: {
      type: "number",
      label: "Label Size",
      default: 12,
    },
    show_icons: {
      type: "boolean",
      label: "Show Icons",
      default: false,
    },
    icon_url: {
      type: "string",
      label: "Icon URL Field",
    },
    big_circle_color: {
      type: "string",
      label: "Big Circle Color",
      default: "#4D6EBF",
    },
    big_circle_font_color: {
      type: "string",
      label: "Big Circle Font Color",
      default: "#FFFFFF",
    },
    small_circle_color: {
      type: "string",
      label: "Small Circle Color",
      default: "#EAEAEA",
    },
    small_circle_font_color: {
      type: "string",
      label: "Small Circle Font Color",
      default: "#000000",
    }
  },
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .circle-packing text {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-size: ${config.label_size}px;
          fill: ${config.big_circle_font_color};
        }
        .circle-packing .label {
          text-anchor: middle;
        }
        .circle-packing .icon {
          width: 24px;
          height: 24px;
        }
      </style>
      <svg></svg>
    `;
    this.svg = d3.select(element).select("svg")
  },
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
    if (!queryResponse.fields.dimensions.length || !queryResponse.fields.measures.length) {
      this.addError({title: "No Dimensions or Measures Found", message: "This visualization requires at least one dimension and one measure."});
      return;
    }

    this.svg.selectAll("*").remove();

    var diameter = Math.min(element.clientWidth, element.clientHeight);
    this.svg.attr("width", diameter).attr("height", diameter);

    let formattedData = data.map(row => ({
      name: row[queryResponse.fields.dimensions[0].name]["value"],
      value: row[queryResponse.fields.measures[0].name]["value"],
      icon: config.show_icons && config.icon_url ? row[config.icon_url]["value"] : null
    }));

    // Sort to ensure the largest value is at the start
    formattedData.sort((a, b) => b.value - a.value);

    // Split data into big circle and the rest
    const [bigCircleData, ...restData] = formattedData;

    // Calculate total of all values for scaling purposes
    const totalValue = formattedData.reduce((sum, d) => sum + d.value, 0);

    const pack = data => d3.pack()
      .size([diameter, diameter])
      .padding(3)(d3.hierarchy({children: data}).sum(d => d.value));

    const root = pack(restData);

    // Add big circle separately
    const bigCircleGroup = this.svg.append("g")
      .attr("transform", `translate(${diameter * 0.2},${diameter / 2})`);
    
    bigCircleGroup.append("circle")
      .attr("r", diameter * 0.2)
      .attr("fill", config.big_circle_color);

    bigCircleGroup.append("text")
      .attr("class", "label")
      .attr("dy", "0.3em")
      .text(bigCircleData.name);

    bigCircleGroup.append("text")
      .attr("class", "label")
      .attr("dy", "1.3em")
      .text(bigCircleData.value);

    if (bigCircleData.icon) {
      bigCircleGroup.append("image")
        .attr("class", "icon")
        .attr("xlink:href", bigCircleData.icon)
        .attr("x", -12)
        .attr("y", -12);
    }

    // Draw the rest of the circles
    const node = this.svg.append("g")
      .attr("transform", `translate(${diameter * 0.6}, 0)`)
      .selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", config.small_circle_color);

    node.append("text")
      .attr("class", "label")
      .attr("dy", "0.3em")
      .text(d => d.data.name.substring(0, d.r / 3));

    if (config.show_icons) {
      node.append("image")
        .attr("class", "icon")
        .attr("xlink:href", d => d.data.icon)
        .attr("x", -12)
        .attr("y", -12);
    }

    doneRendering();
  }
});
