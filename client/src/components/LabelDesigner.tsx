import React, { Dispatch, useEffect, useRef } from "react";
import { throttle } from "lodash";

import { AppState } from "../hooks/layoutReducer";
import { Action } from "../hooks/layoutReducer/actions";
import { CanvasField, isCanvasTextField } from "../types";
import { getBarcodeGeneratorByBarcodeType } from "../models/barcodes";
import {
  clearCanvas,
  getCanvasMousePosition,
  withCanvasRotation
} from "../canvas";

const LabelDesigner: React.FC<{
  state: AppState;
  dispatch: Dispatch<Action>;
}> = ({ state, dispatch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // Set the context
  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx != null) {
        dispatch({ type: "SET_RENDERING_CONTEXT", value: ctx });
      }
    }
  }, [dispatch]);

  // Update the canvas size
  useEffect(() => {
    if (state.ctx && parentRef && parentRef.current) {
      const computedStyle = getComputedStyle(parentRef.current);

      if (computedStyle && computedStyle.width) {
        const width =
          state.canvasToParentScale *
          parseInt(computedStyle.getPropertyValue("width").slice(0, -2));
        const height = state.labelType
          ? (state.labelType.height / state.labelType.width) * width
          : width * 0.5;
        dispatch({ type: "SET_CANVAS_DIMENSIONS", value: { width, height } });
      }
    }
  }, [
    state.ctx,
    parentRef,
    state.labelType,
    state.canvasToParentScale,
    dispatch
  ]);

  // Set the canvas event listeners
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx == null) return;

    ctx.canvas.addEventListener("selectstart", e => {
      e.preventDefault();
      return false;
    });

    ctx.canvas.addEventListener("mousedown", e => {
      dispatch({ type: "MOUSE_DOWN", value: getCanvasMousePosition(ctx, e) });
    });

    ctx.canvas.addEventListener("dblclick", e => {
      dispatch({ type: "DOUBLE_CLICK", value: getCanvasMousePosition(ctx, e) });
    });

    ctx.canvas.addEventListener(
      "mousemove",
      throttle(
        e => {
          dispatch({
            type: "SET_CANVAS_MOUSE_POSITION",
            value: getCanvasMousePosition(ctx, e)
          });
        },
        50,
        { leading: true }
      )
    );

    ctx.canvas.addEventListener("mouseup", e => {
      dispatch({ type: "MOUSE_UP" });
    });
  }, [dispatch]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx == null) return;

    // Make sure all the generated barcodes are loaded first
    Promise.all(
      state.canvasFields.map(field => {
        // Immediately resolve if this is a CanvasTextField
        if (isCanvasTextField(field)) {
          return Promise.resolve(field);
        } else {
          // Otherwise create a new Promise
          return new Promise<CanvasField>((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
              field.img = img;

              dispatch({
                type: "UPDATE_BARCODE_FIELD_DRAWN_DIMENSIONS",
                canvasField: field,
                value: { width: img.width, height: img.height }
              });

              // Resolve the promise once the browser has loaded the image
              resolve(field);
            };

            getBarcodeGeneratorByBarcodeType(field.barcodeType)(field).then(
              (barcode: string) => {
                img.src = barcode;
              }
            );
          });
        }
      })
    )
      .then(fields => {
        clearCanvas(
          ctx,
          state.canvasDimensions.width,
          state.canvasDimensions.height
        );

        fields.filter(isCanvasTextField).forEach(field => {
          // Set some font styles
          ctx.textAlign = "start";
          ctx.fillStyle = "#000";
          ctx.textBaseline = "bottom";
          ctx.font = `${field.drawnHeight}px ${field.canvasFont}`;

          if (field.canvasRotation !== 0) {
            withCanvasRotation(
              ctx,
              field.canvasX,
              field.canvasY,
              field.canvasRotation,
              () => ctx.fillText(field.value, 0, 0)
            );
          } else {
            ctx.fillText(field.value, field.canvasX, field.canvasY);
          }
        });

        return fields;
      })

      // ...finally render the barcode fields
      .then(fields => {
        fields.forEach((field: CanvasField) => {
          if (!isCanvasTextField(field)) {
            if (!field.img) return;

            if (field.canvasRotation !== 0) {
              withCanvasRotation(
                ctx,
                field.canvasX,
                field.canvasY,
                field.canvasRotation,
                () => field.img && ctx.drawImage(field.img, 0, 0)
              );
            } else {
              ctx.drawImage(field.img, field.canvasX, field.canvasY);
            }

            dispatch({
              type: "UPDATE_BARCODE_FIELD_DRAWN_DIMENSIONS",
              canvasField: field,
              value: { width: field.img.width, height: field.img.height }
            });
          }
        });
      });
  }, [state.canvasFields, state.canvasDimensions, dispatch]);

  return (
    <div ref={parentRef} className="center-col flex flex-col items-center">
      <div className="flex-grow flex flex-col justify-around">
        <canvas
          className="bg-white border border-black rounded-lg"
          width={state.canvasDimensions.width}
          height={state.canvasDimensions.height}
          ref={canvasRef}
        />
      </div>

      <div className="h-12">
        <input
          type="range"
          value={state.canvasToParentScale}
          min="0.3"
          max="1"
          step="0.010"
          onChange={throttle(e => {
            dispatch({
              type: "SET_CANVAS_TO_PARENT_SCALE",
              value: parseFloat(e.target.value)
            });
          }, 50)}
        />
      </div>
    </div>
  );
};

export default LabelDesigner;
