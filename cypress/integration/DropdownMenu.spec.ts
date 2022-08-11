function getCy(useShadowDom: boolean = false) {
  return useShadowDom ? cy.get('#shadow-test-container').shadow() : cy;
}

function generateTestCases(useShadowDom: boolean) {
  describe(`DropdownMenu${useShadowDom ? ' (with Shadow DOM)' : ''}`, () => {
    describe('given submenu user', () => {
      beforeEach(() => {
        cy.visitStory(useShadowDom ? 'dropdownmenu--in-shadow-root' : 'dropdownmenu--submenus');
        getCy(useShadowDom).findByText('Open').click();
      });

      describe('when using pointer', () => {
        it('should open submenu and not focus first item when moving pointer over trigger', () => {
          pointerOver('Bookmarks →');
          getCy(useShadowDom).findByText('Inbox').should('not.be.focused');
        });

        it('should not close when moving pointer to submenu and back to parent trigger', () => {
          pointerOver('Bookmarks →');
          pointerOver('Inbox');
          pointerOver('Bookmarks →');
          getCy(useShadowDom).findByText('Inbox').should('be.visible');
        });

        it(
          'should close submenu when moving pointer away but remain open when moving towards',
          {
            viewportWidth: 550,
          },
          () => {
            // Moving away
            pointerOver('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('be.visible');
            pointerExitRightToLeft('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('not.exist');

            // Moving towards
            pointerOver('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('be.visible');
            pointerExitLeftToRight('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('be.visible');

            // Test at collision edge
            // Moving away
            pointerOver('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('be.visible');
            pointerExitLeftToRight('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('not.exist');

            // Moving towards
            pointerOver('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('be.visible');
            pointerExitRightToLeft('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('be.visible');
          }
        );

        it('should close open submenu when moving pointer to any item in parent menu', () => {
          // Item
          pointerOver('Bookmarks →');
          pointerOver('Inbox');
          pointerOver('New Tab');
          getCy(useShadowDom).findByText('Inbox').should('not.exist');

          // Disabled item
          pointerOver('Bookmarks →');
          pointerOver('Inbox');
          pointerOver('Print…');
          getCy(useShadowDom).findByText('Inbox').should('not.exist');

          // Trigger item
          pointerOver('Bookmarks →');
          pointerOver('Inbox');
          pointerOver('Tools →');
          getCy(useShadowDom).findByText('Inbox').should('not.exist');

          // Disabled trigger item
          pointerOver('Bookmarks →');
          pointerOver('Inbox');
          pointerOver('History →');
          getCy(useShadowDom).findByText('Inbox').should('not.exist');
        });

        it('should close unassociated submenus when moving pointer back to the root trigger', () => {
          // Open multiple nested submenus and back to trigger in root menu
          pointerOver('Bookmarks →');
          pointerOver('WorkOS →');
          pointerOver('Radix');
          pointerOver('Bookmarks →');

          getCy(useShadowDom).findByText('Inbox').should('be.visible');
          getCy(useShadowDom).findByText('Radix').should('not.exist');
        });

        it('should close all menus when clicking item in any menu, or clicking outside', () => {
          // Root menu
          getCy(useShadowDom).findByText('New Tab').click();
          getCy(useShadowDom).findByText('New Tab').should('not.exist');

          // Submenu
          getCy(useShadowDom).findByText('Open').click();
          pointerOver('Bookmarks →');
          getCy(useShadowDom).findByText('Inbox').click();
          getCy(useShadowDom).findByText('New Tab').should('not.exist');
          getCy(useShadowDom).findByText('Inbox').should('not.exist');

          // Click outside
          getCy(useShadowDom).findByText('Open').click();
          cy.get('body').click({ force: true });
          getCy(useShadowDom).findByText('New Tab').should('not.exist');
        });
      });

      describe('When using keyboard', () => {
        it('should not open submenu when moving focus to trigger', () => {
          getCy(useShadowDom).findByText('Bookmarks →').focus();
          getCy(useShadowDom).findByText('Inbox').should('not.exist');
        });

        it('should open submenu and focus first item when pressing right arrow, enter or space key', () => {
          function shouldOpenOnKeydown(key: string) {
            getCy(useShadowDom).findByText('Bookmarks →').trigger('keydown', { key });
            getCy(useShadowDom)
              .findByText('Inbox')
              .should('be.focused')
              .trigger('keydown', { key: 'ArrowLeft' });
          }

          shouldOpenOnKeydown(' ');
          shouldOpenOnKeydown('Enter');
          shouldOpenOnKeydown('ArrowRight');
        });

        it('should close only the focused submenu when pressing left arrow key', () => {
          getCy(useShadowDom).findByText('Bookmarks →').type('{enter}');
          getCy(useShadowDom).findByText('WorkOS →').type('{enter}');
          getCy(useShadowDom).findByText('Stitches').type('{leftarrow}').should('not.exist');
          getCy(useShadowDom).findByText('WorkOS →').should('be.visible');
          getCy(useShadowDom).findByText('New Window').should('be.visible');
        });

        it('should focus first item when pressing right arrow key after opening submenu with mouse', () => {
          pointerOver('Bookmarks →');
          getCy(useShadowDom).findByText('Inbox').should('be.visible');
          getCy(useShadowDom).findByText('Bookmarks →').type('{rightarrow}');
          getCy(useShadowDom).findByText('Inbox').should('be.focused');
        });

        it('should close all menus when pressing escape, enter or space key on any item', () => {
          // Test close on root menu
          getCy(useShadowDom).findByText('New Window').type('{esc}').should('not.exist');

          // Reopen menu and test keys from within the submenu
          getCy(useShadowDom).findByText('Open').click();
          getCy(useShadowDom).findByText('Bookmarks →').type('{enter}');
          getCy(useShadowDom).findByText('Inbox').type('{esc}').should('not.exist');
          getCy(useShadowDom).findByText('New Window').should('not.exist');
        });

        it('should scope typeahead behaviour to the active menu', () => {
          // Matching items outside of the active menu should not become focused
          pointerOver('Bookmarks →');
          pointerOver('WorkOS →');
          getCy(useShadowDom).findByText('Stitches').focus().type('Inbox');
          getCy(useShadowDom).findByText('Inbox').should('not.have.focus');

          // Matching items inside of active menu should become focused
          pointerOver('Notion').focus().type('Inbox');
          getCy(useShadowDom).findByText('Inbox').should('have.focus');
        });
      });

      describe('When using pointer in RTL', () => {
        beforeEach(() => {
          getCy(useShadowDom).findByText('Right-to-left').click({ force: true });
          getCy(useShadowDom).findByText('Open').click();
        });

        it(
          'should close submenu when pointer moves away but remain open when moving towards',
          {
            viewportWidth: 550,
          },
          () => {
            // Moving away
            pointerOver('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('be.visible');
            pointerExitLeftToRight('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('not.exist');

            // Moving towards
            pointerOver('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('be.visible');
            pointerExitRightToLeft('Bookmarks →');
            getCy(useShadowDom).findByText('Inbox').should('be.visible');

            // Test at collision edge
            // Moving away
            pointerOver('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('be.visible');
            pointerExitRightToLeft('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('not.exist');

            // Moving towards
            pointerOver('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('be.visible');
            pointerExitLeftToRight('WorkOS →');
            getCy(useShadowDom).findByText('Radix').should('be.visible');
          }
        );
      });

      describe('When using keyboard in RTL', () => {
        beforeEach(() => {
          getCy(useShadowDom).findByText('Right-to-left').click({ force: true });
          getCy(useShadowDom).findByText('Open').click();
        });

        it('should open submenu and focus first item when pressing left arrow key but close when pressing right arrow key', () => {
          getCy(useShadowDom).findByText('Bookmarks →').trigger('keydown', { key: 'ArrowLeft' });
          getCy(useShadowDom)
            .findByText('Inbox')
            .should('be.focused')
            .trigger('keydown', { key: 'ArrowRight' })
            .and('not.exist');

          // Root level menu should remain open
          getCy(useShadowDom).findByText('New Tab').should('be.visible');
        });
      });
    });

    /* ---------------------------------------------------------------------------------------------- */

    function pointerExitRightToLeft(elementText: string) {
      return getCy(useShadowDom)
        .findByText(elementText)
        .should('be.visible')
        .realHover({ position: 'right' })
        .realHover({ position: 'bottomLeft' })
        .trigger('pointerout', 'bottomLeft', { pointerType: 'mouse', force: true });
    }

    function pointerExitLeftToRight(elementText: string) {
      return getCy(useShadowDom)
        .findByText(elementText)
        .should('be.visible')
        .realHover({ position: 'left' })
        .realHover({ position: 'bottomRight' })
        .trigger('pointerout', 'bottomRight', { pointerType: 'mouse', force: true });
    }

    function pointerOver(elementText: string) {
      return getCy(useShadowDom).findByText(elementText).should('be.visible').realHover();
    }
  });
}

// Generate test cases with or without Shadow DOM
generateTestCases(false);
generateTestCases(true);
