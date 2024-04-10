(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click keypress", function(event) { /* Ajout de keypress pour touche "entrée" du clavier */
      if (event.type === "click" || (event.type === "keypress" && event.which === 13)) /* 13 = touche "entrée" */
      {
        if (options.lightBox && $(this).prop("tagName") === "IMG") {
          $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
        } else {
          return;
        }
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = $(".lightboxImage").attr("src"); /* Source de l'img seléctionnée */
      let activeTag = $(".tags-bar button.active-tag").data("images-toggle"); /* Récupère la catégorie de l'img dans la barre de filtre */
      let imagesCollection = []; /* Tableau qui contient les URL des images */
      // Collection d'URL d'images en fonction du tag/filtre actif
      if (activeTag === "all") {
        $(".item-column img.gallery-item").each(function() {
          // Ajoute l'URL de chaque img à la collection (tableau)
          imagesCollection.push($(this).attr("src"));
        });
      } 
      else {
        $(".item-column img.gallery-item").each(function() {
          if ($(this).data("gallery-tag") === activeTag) {
            // Ajoute l'URL de chaque img correspondant au tag à la collection
            imagesCollection.push($(this).attr("src"));
          }
        });
      }
      let index = imagesCollection.indexOf(activeImage); /* Trouve l'index de l'img affichée */
      let prevIndex = (index - 1 + imagesCollection.length) % imagesCollection.length; /* Rech. l'index de l'img précédente */
      let prevImageSrc = imagesCollection[prevIndex]; /* Rech. l'URL de l'img précédente */
      $(".lightboxImage").attr("src", prevImageSrc); /* MAJ de l'URL de l'img affichée */
    },
    nextImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let activeTag = $(".tags-bar button.active-tag").data("images-toggle");
      let imagesCollection = [];
      // Construire une collection d'images à partir de la galerie
      $(".gallery-item").each(function() {
          if (activeTag === "all" || $(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).attr("src"));
          }
      });
      // Trouver l'index de l'image actuellement affichée dans la collection
      let currentIndex = imagesCollection.indexOf(activeImage);
      // Sélectionner l'index de l'image suivante dans la séquence
      let nextIndex = (currentIndex + 1) % imagesCollection.length;
      // Mettre à jour l'image affichée dans la modale
      $(".lightboxImage").attr("src", imagesCollection[nextIndex]);
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<aside class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<button class="mg-prev" aria-label="Image précédente" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;" tabindex="0"><</button>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique">
                            ${
                              navigation
                                ? '<button class="mg-next" aria-label="Image suivante" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}" tabindex="0">></button>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </aside>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><button class="nav-link active active-tag"  data-images-toggle="all">Tous</button></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <button class="nav-link" tabindex="0" data-images-toggle="${value}">${value}</button></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);
