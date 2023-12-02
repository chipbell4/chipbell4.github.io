---
layout: post
title: "THREEJS Car Loading Screen Animation"
date: 2023-11-29 08:39:36
categories: javascript threejs
---

## Introduction
Well, I'm back I guess?

I recently decided to implement the startup screen animation from my Toyota RAV4 using three.js.
Here's what it (the startup screen) looks like: ![Rav 4 startup screen](/assets/rav4/rav4.gif)

Ignoring the RAV4 logo, the animation is mostly a bunch of wireframe triangles zooming into the camera.
I figured it'd be a good opportunity to brush up on three.js without being overly ambitious.

TLDR; the code for it is [on GitHub](https://github.com/chipbell4/rav4),
and a demo is available [here](/assets/rav4/demo/index.html)

## Initial Rendering and General Approach
I mostly followed [the tutorial](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene) on the three.js website.
As a brief refresher, three.js has the concept of a "scene" in which you add 3D objects to it, in our case a "mesh".
The starting tutorial begins by adding a `Mesh` built of a `BoxGeometry` (defining the shape of the cube) with a `MeshBasicMaterial` (which defines the color).

I replaced that `Mesh` with my own: A very simple `TriangleMesh` type that would build a triangle given a set of vertices.
Moreover, the triangle can figure out it's own color based on it's normal:
For a lower `x` value (read "negative") the color is darker, and for a higher `x` value, the color is lighter.
Something like this:

```javascript
function color(normal) {
    // Since normal is a unit vector, normal.x can range between -1 and 1. 
    // We can linear interpolate between black and white to shade.
    // The formula below scales normal.x to be in the range (0, 1)
    const intensity = (normal.x + 1) / 2

    // Return as a shade of gray
    return rgb(intensity, intensity, intensity)
}
```

I then created a triangle "manager" to move the triangles around to look like the RAV4's loading screen.
This consists of the following steps:
- Create a few rows of triangles with randomized heights
- Every frame, move the triangles toward the viewer at some velocity (`moveTriangles(dt)`).
- When a triangle moves off screen, remove it from the scene and stop tracking so it's garbage-collected (`pruneInvisible()`)
- When the furthest away row gets close enough, add another row behind it so the triangles appear infinite. (`addRow()`).

I took a quick profile in Firefox of the performance here:
![initial performance profile](/assets/rav4/initial_performance.png)

As you can see, three.js really takes up most the loop. However, we can improve our performance a little, and it'll be an interesting process. Let's go!

## Initial Performance Concerns
The manager currently stores triangles as a flat array of triangles.
The `moveTriangles` function mostly loops over each triangle and increments their `z` position.
The `pruneInvisible` does a similar loop where it loops over each triangle determining which ones are invisible and adding them (or not) to a "keep" list. Something like this:

```javascript
function pruneInvisible() {
    const keepers = [];
    for (const triangle of this.triangles) {
        if (isVisible(triangle)) {
            keepers.push(triangle)
        } else {
            scene.remove(triangle);
        }
    }
    this.triangles = keepers;
}
```

This loop will cause invisible triangles to get removed from the scene and consequently removed from the main `triangles` list.
As a result, they'll stop being updated and eventually get garbage collected.

However, we can do better!
This loop currently looks at _every_ triangle in the set even though it's unlikely that every triangle would be pruned.
Given the way that we add triangles to list, we know that triangles will become invisible _in a group_ based on the row that they're in.

So, we can reorganize our triangles as a two-dimensional array:

```javascript
this.rows = [
    [triangle1, triangle2, triangle3, ...] // row 1
    [triangleA, triangleB, triangleC, ...] // row 2
    // and so on...
]
```
Whenever we add a row, we add it to the end of the list which will mean that the first row is always the _closest one to the screen_.
So, when we prune we only have to look at the first row.
Our function then can become this:
```javascript
function pruneInvisible() {
    if (!isVisible(this.rows[0][0])) {
        this.rows.splice(0, 1);
    }
}
```

Nice! Now this loop is now constant time. Here's how performance changed:
![performance profile after row organization](/assets/rav4/row_reorg.png).

So, it looks like we managed to improve performance by a rough factor of 2 (our `update` function went from 2.5% of CPU samples to 1.3%)!
But we can do better...

## Recycling Triangles
The most performance intensive part of our code now is `addRow`.
Whenever a row of triangles is pruned as it goes off screen, we remove the row, let it get garbage-collected, and then create a new row at the end.
What if we instead started with all the rows we needed, and recyled triangles as they went off screen?
This would push all memory allocation to creation of the triangle manager, and then never allocating again.
This would potentially improving rendering speed (especially if we had a lot of triangles), with the tradeoff of making initial start-up slower.

Our new algorithm would look something like this:
- At start-up, the triangle manager would spawn some pre-configured number of rows of triangles
- The last row of triangles would need to match up _perfectly_ with the first row so that as we cycle through the rows we don't see a discontinuity in the terrain.
- When a row moves off-screen, we would reset it's z-coordinate to line up with the last row in the list.
- The triangle manager would keep track of the index of the current closest row. When checking for offscreen triangles it would only look at that row. We assumed it was always index 0, but with our new approach, existing rows will be pushed backwards as they go offscreen. As we push a row backwards, we'll need to increment that counter so we know which row to check.

After making that refactor, here's what we got:

![performance profile after refactoring](/assets/rav4/after_recyling.png)

Interestingly, the numbers don't look all that different!
Moreover, `moveTriangles` is taking up more time that it did before, although I didn't change anything.
I suspect this may be a symptom of very low sample count, but I'm not positive.

## Conclusion
Well, this was pretty fun to build, and it was fun trying to (micro) optimize it.
I'm not sure why the object recyling refactor didn't improve performance, but I suspect we could dig deeper and investigate the code in isolation and find more answers. Maybe in a later post?
