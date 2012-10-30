/*
m = size of trainingset
c = all points in cluster
ci = cluster item
K = number of clusters
y = centroid
k = index of cluster
*/

function Vector(x, y) {
	this.x = x
	this.y = y
}
Vector.prototype.subtract = function(v) {
	return new Vector(this.x - v.x, this.y - v.y)
}
Vector.prototype.lessThan = function(v) {
	return Math.abs(this.x + this.y) < Math.abs(v.x + v.y)
}

Array.prototype.flatMap = function(fun) {
	var m = this.map(fun), r = []
	for (var i = 0; i < m.length; i++)
		for (var j = 0; j < m[i].length; j++)
			r.push(m[i][j])
	return r
}

function mean(vs) {
	var x = 0, y = 0, len = vs.length
	for (var i = 0; i < len; i++) {
		x += vs[i].x
		y += vs[i].y
	}
	return new Vector(x / len, y / len)
}

function assert(test, msg) {
	if (!test) throw msg
}

function distortionFunction(clusters) {
	var centroids    = clusters.map(function(c) { return c.centroid }),
		clusterItems = clusters.flatMap(function(c) { return c.clusterItems }),
	 	m            = clusterItems.length,
		K            = centroids.length

	assert(K > 1, "Number of clusters (K) should be more than 1.")
	assert(K < m, "Number of clusters (K) should be less than the of the size training set.")

	// 1. cluster assignment
	var clusterAssignmentResult = centroids.map(function() { return [] })
	for (var i = 0; i < m; i++) {
		var ci           = clusterItems[i],
			// compute distance for first centroid
			minDelta     = ci.subtract(centroids[0]),
			nearestIndex = 0

		for (var k = 1; k < K; k++) {
			var delta = ci.subtract(centroids[k])
			if (delta.lessThan(minDelta)) {
				nearestIndex = k;
				minDelta = delta;
			}
		}
		clusterAssignmentResult[nearestIndex].push(ci)
	}

	// 2. move centroid
	var cleanResult = clusterAssignmentResult.filter(function(r) { return r.length > 0 })
	for (var k = 0; k < cleanResult.length; k++)
		cleanResult[k] = { centroid: mean(cleanResult[k]), clusterItems: cleanResult[k] }
	
	return cleanResult
}

