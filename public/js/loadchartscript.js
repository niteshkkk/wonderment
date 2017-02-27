           
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {    

        var data = google.visualization.arrayToDataTable(abc);
        var options = {
          format: "M d, yyyy",
          titlePosition: 'none',
          bar: {
            groupWidth: "100%"
          },
          textStyle: {
            fontSize: 9,
            color: '#1e505d',
            bold: false,
            italic: false,
          },
          titleTextStyle: {
            fontSize: 16,
            color: '#1e505d',
            bold: true,
            italic: false,
            center: true
          },

          vAxis: {
            title: 'Total Projected Channel ARPI($)',
            format: 'currency',
            textStyle: {
              fontSize: 12,
              color: '#1e505d',
              bold: false,
              italic: false
            },
            titleTextStyle: {
              fontSize: 16,
              color: '#1e505d',
              bold: true,
              italic: false
            }
          },

          hAxis: {
            title: "Channel",
            slantedText : false,
            //slantedTextAngle: 60,
            textStyle: {
              fontSize: 12,
              color: '#1e505d',
              bold: true,
              italic: false
            },
            titleTextStyle: {
              fontSize: 16,
              color: '#1e505d',
              bold: true,
              italic: false
            }
          },
          height: 600,
          colors: [
            '#ff0400','#ff8d41','#ffeb00','#7af66f','#0067b7','#4900fd','#e7e7e7','#fcdab5','#c4ff24','#00f4cf',
            '#ff7371','#fda662','#e3da72','#90de89','#86bef3','#a38ed7','#d1d3d4','#d9ac7b','#c4e372','#72e3d2',
            '#ef434e','#af4300','#e0b640','#96bb93','#2d94f6','#a86f96','#a7a9ac','#ac6534','#a2d223','#32887b',
            '#be2027','#cb600e','#bfaf10','#39a21d','#237bbc','#581f99','#808285','#815512','#6f880d','#109986',
            '#6c0004','#ffb515','#edd700','#135b00','#074f84','#290057','#000000','#513100','#4f6300','#00584c'
          ]
        };

         var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
         chart.draw(data, google.charts.Bar.convertOptions(options));


        
      }
