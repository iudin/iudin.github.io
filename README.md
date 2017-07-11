Here I will post some examples of my code.

## One-page gallery

[Demo](https://iudin.github.io/gallery/)

Let's start with an example of simple image gallery.

The gallery is implemented as one page, on which images are downloaded asynchronously. Each image is assigned a unique URL. This allows, for example, to send a link to a specific image to a friend, even though the page is one. In addition, you can switch images using the browser navigation buttons. This result is achieved through the use of two key technologies: `Promises` and `History API`.

You can see the source code of the gallery [here](https://github.com/iudin/iudin.github.io/tree/master/gallery).
